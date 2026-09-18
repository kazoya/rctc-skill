import sqlite3

c = sqlite3.connect(r"C:\Belt\APCA-SmartHelp\backend\data\knowledge.sqlite")
for q in ["SDAIA", "سدايا", "Ministry of Tourism", "السياحة", "ZATCA", "Cisco", "الرؤيا", "الشهادات"]:
    rows = c.execute(
        "SELECT document_id, page_from, substr(text_original,1,100) FROM passages WHERE text_original LIKE ? LIMIT 2",
        (f"%{q}%",),
    ).fetchall()
    print("---", q)
    for row in rows:
        print(row)
