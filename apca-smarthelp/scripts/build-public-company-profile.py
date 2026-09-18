from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT = Path(r"C:\Belt\embeddings\pdf\ITB_Public_Company_Profile_2026-07-22.pdf")
LOGO = Path(r"C:\Belt\embeddings\img\image001.png")


def footer(canvas, document):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#5b6770"))
    canvas.drawString(18 * mm, 12 * mm, "Public-source knowledge snapshot - verified 2026-07-22")
    canvas.drawRightString(192 * mm, 12 * mm, f"Page {document.page}")
    canvas.restoreState()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "ProfileTitle", parent=styles["Title"], alignment=TA_CENTER,
        textColor=colors.HexColor("#124b6b"), fontSize=22, leading=28,
    )
    h2 = ParagraphStyle(
        "ProfileHeading", parent=styles["Heading2"],
        textColor=colors.HexColor("#118db2"), spaceBefore=10, spaceAfter=6,
    )
    body = ParagraphStyle("ProfileBody", parent=styles["BodyText"], leading=15, spaceAfter=7)
    small = ParagraphStyle("ProfileSmall", parent=body, fontSize=8.5, leading=11, textColor=colors.HexColor("#46545c"))

    story = []
    if LOGO.is_file():
        story.extend([Image(str(LOGO), width=48 * mm, height=23 * mm), Spacer(1, 5 * mm)])
    story.extend([
        Paragraph("IT Belt Company (ITB)", title),
        Paragraph("Public company and professional-network profile", styles["Heading3"]),
        Spacer(1, 4 * mm),
        Paragraph(
            "Purpose: a compact, source-labelled knowledge document for customer-service answers. "
            "It contains only public business information and must not be used to infer private employee details.", body,
        ),
        Paragraph("Company at a glance", h2),
    ])

    facts = [
        ["Founded", "2008"],
        ["Headquarters", "Riyadh, Saudi Arabia"],
        ["Business", "IT services and consulting; IT/OT cybersecurity; cloud services; digital transformation; enterprise systems; IT infrastructure; IoT; physical security"],
        ["LinkedIn company size", "51-200 employees (a LinkedIn range, not an audited headcount)"],
        ["Official-site indicators", "15+ years of service in Saudi Arabia; 20+ vendors; 80+ customers; 8+ industries"],
        ["Public contact", "info@itb.com.sa | +966 11 215 0044 | www.itb.com.sa"],
        ["Official-site address", "Olaya Street, Riyadh 12572, Saudi Arabia"],
    ]
    table_rows = [
        [Paragraph(label, ParagraphStyle("FactLabel", parent=small, fontName="Helvetica-Bold", textColor=colors.HexColor("#124b6b"))),
         Paragraph(value, small)]
        for label, value in facts
    ]
    table = Table(table_rows, colWidths=[42 * mm, 130 * mm], repeatRows=0)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#d9f0f6")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#124b6b")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEADING", (0, 0), (-1, -1), 12),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9ab9c5")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.extend([
        table,
        Paragraph("Positioning and capabilities", h2),
        Paragraph(
            "ITB presents itself as a Saudi provider combining strategic consulting with services and solutions "
            "that help organizations build, modernize, and protect their operations. The official site groups its "
            "current offer around cybersecurity and compliance, cloud services, digital transformation, ERP, "
            "low-current and physical security, and advanced infrastructure.", body,
        ),
        Paragraph(
            "The official site states that its consultants hold certifications from organizations and vendors such as "
            "ISC2, SANS, BSI, ISACA, Cisco, Check Point, Trend Micro, Palo Alto, IBM, RSA, and Microsoft. "
            "This is a company-level statement and does not assign a certification to any named person.", body,
        ),
        Paragraph("Mission and vision", h2),
        Paragraph(
            "Mission summary: provide state-of-the-art IT solutions and professional project management that improves "
            "performance and project success. Vision summary: provide innovative, value-added, world-class services "
            "and guidance while building regional and international leadership.", body,
        ),
        PageBreak(),
        Paragraph("Public LinkedIn team signals", h2),
        Paragraph(
            "LinkedIn lists ITB as a privately held IT Services and IT Consulting company in Riyadh, founded in 2008, "
            "with a company-size range of 51-200 employees. At verification time, the company page displayed the "
            "following representative employee names: Imran Ahmed Khanzada, Mohammed Hamaidan, Hussain Alshaqha, "
            "and Mostafa Badran. Their job titles were not displayed in the public company-page result, so this "
            "document intentionally does not infer roles or responsibilities.", body,
        ),
        Paragraph(
            "A recent company update also publicly tagged Ahmed Al Jilani, Ammar Alamleh, and Mishal Alohali in the "
            "context of a 2026 Ramadan team gathering. A tag demonstrates public association with that post only; "
            "it must not be treated as proof of a current title or employment status.", body,
        ),
        Paragraph("Customer-service answer rules", h2),
        Paragraph(
            "For general company questions, prefer the official website. For employee questions, describe the team at "
            "the company level. Mention a person's name only when the user asks and only with the exact public context "
            "in this snapshot. Never guess titles, phone numbers, emails, availability, reporting lines, or private details.", body,
        ),
        Paragraph(
            "Because staff and social-network information changes, answers should say that this snapshot was verified "
            "on 22 July 2026 and offer the official LinkedIn page for the latest public listing.", body,
        ),
        Paragraph("Sources", h2),
        Paragraph("1. Official website (English): https://www.itb.com.sa/default.aspx", small),
        Paragraph("2. Official website (Arabic): https://www.itb.com.sa/Defaultar.aspx", small),
        Paragraph("3. Official LinkedIn company page: https://www.linkedin.com/company/itbelt", small),
        Paragraph("4. ITB ISO/IEC 20000-1:2018 certificate: https://www.itb.com.sa/assets/media/photo/iso/isoh3.pdf", small),
        Spacer(1, 5 * mm),
        Paragraph(
            "Source note: LinkedIn follower counts, staff listings, and posts are dynamic. This document is a dated "
            "knowledge snapshot, not an HR directory.", small,
        ),
    ])

    document = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=17 * mm, bottomMargin=20 * mm,
        title="ITB Public Company Profile", author="ITB Knowledge Gateway",
    )
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    build()
