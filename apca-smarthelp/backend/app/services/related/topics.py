from __future__ import annotations

from backend.app.db.database import connect
from backend.app.models.schemas import RelatedTopic
from backend.app.services.search.hybrid import hybrid_search


def get_related_topics(topic_id: str, limit: int = 8) -> list[RelatedTopic]:
    """JavaHelp-style related topics: siblings + children + semantic neighbors."""
    out: list[RelatedTopic] = []
    seen = {topic_id}

    with connect() as conn:
        topic = conn.execute("SELECT * FROM topics WHERE id=?", (topic_id,)).fetchone()
        if not topic:
            return []

        # Children ("More information")
        children = conn.execute(
            """SELECT id, title, page_from FROM topics
               WHERE parent_topic_id=? ORDER BY order_index LIMIT ?""",
            (topic_id, limit),
        ).fetchall()
        for c in children:
            if c["id"] not in seen:
                out.append(RelatedTopic(id=c["id"], title=c["title"], reason="child", page_from=c["page_from"]))
                seen.add(c["id"])

        # Siblings under same chapter / parent
        if topic["parent_topic_id"]:
            siblings = conn.execute(
                """SELECT id, title, page_from FROM topics
                   WHERE parent_topic_id=? AND id<>? ORDER BY order_index LIMIT ?""",
                (topic["parent_topic_id"], topic_id, limit),
            ).fetchall()
        else:
            siblings = conn.execute(
                """SELECT id, title, page_from FROM topics
                   WHERE chapter_id=? AND id<>? AND parent_topic_id IS NULL
                   ORDER BY order_index LIMIT ?""",
                (topic["chapter_id"], topic_id, limit),
            ).fetchall()
        for s in siblings:
            if s["id"] not in seen:
                out.append(RelatedTopic(id=s["id"], title=s["title"], reason="sibling", page_from=s["page_from"]))
                seen.add(s["id"])

        seed_text = topic["title"] or ""

    # Semantic neighbors
    if seed_text and len(out) < limit:
        try:
            resp = hybrid_search(
                seed_text,
                document_id=topic["document_id"],
                top_k=limit * 2,
                return_all=True,
            )
            for hit in resp.results:
                if hit.topic_id in seen:
                    continue
                out.append(
                    RelatedTopic(
                        id=hit.topic_id,
                        title=hit.topic_title,
                        reason="semantic",
                        page_from=hit.page_from,
                    )
                )
                seen.add(hit.topic_id)
                if len(out) >= limit:
                    break
        except Exception:
            pass

    return out[:limit]
