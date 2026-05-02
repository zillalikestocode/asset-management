from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Flowable
import re

OUTPUT = "/Users/macbookprom1/projects/asset-management/documentations/AssetFlow_MVP_PRD.pdf"

# ── Colours ────────────────────────────────────────────────────────────────────
BRAND      = colors.HexColor("#1A56DB")   # blue
BRAND_DARK = colors.HexColor("#1239A6")
ACCENT     = colors.HexColor("#F0F4FF")   # light blue bg
DARK       = colors.HexColor("#111827")
MID        = colors.HexColor("#374151")
MUTED      = colors.HexColor("#6B7280")
RED_SOFT   = colors.HexColor("#FEE2E2")
RED_TEXT   = colors.HexColor("#991B1B")
GREEN_SOFT = colors.HexColor("#D1FAE5")
GREEN_TEXT = colors.HexColor("#065F46")
BORDER     = colors.HexColor("#E5E7EB")
WHITE      = colors.white
PAGE_BG    = colors.white

W, H = A4
MARGIN = 2 * cm

# ── Styles ─────────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

styles = {
    "cover_title": S("cover_title",
        fontName="Helvetica-Bold", fontSize=36, leading=44,
        textColor=WHITE, alignment=TA_LEFT, spaceAfter=8),
    "cover_sub": S("cover_sub",
        fontName="Helvetica", fontSize=14, leading=20,
        textColor=colors.HexColor("#BFD1FF"), alignment=TA_LEFT, spaceAfter=6),
    "cover_meta": S("cover_meta",
        fontName="Helvetica", fontSize=10, leading=14,
        textColor=colors.HexColor("#93C5FD"), alignment=TA_LEFT),
    "section_num": S("section_num",
        fontName="Helvetica-Bold", fontSize=9, leading=12,
        textColor=BRAND, spaceBefore=24, spaceAfter=2),
    "h1": S("h1",
        fontName="Helvetica-Bold", fontSize=20, leading=26,
        textColor=DARK, spaceAfter=10),
    "h2": S("h2",
        fontName="Helvetica-Bold", fontSize=14, leading=19,
        textColor=DARK, spaceBefore=18, spaceAfter=6),
    "h3": S("h3",
        fontName="Helvetica-Bold", fontSize=11, leading=15,
        textColor=MID, spaceBefore=12, spaceAfter=4),
    "body": S("body",
        fontName="Helvetica", fontSize=9.5, leading=15,
        textColor=MID, spaceAfter=4),
    "body_bold": S("body_bold",
        fontName="Helvetica-Bold", fontSize=9.5, leading=15,
        textColor=DARK, spaceAfter=4),
    "bullet": S("bullet",
        fontName="Helvetica", fontSize=9.5, leading=14,
        textColor=MID, leftIndent=14, bulletIndent=0,
        spaceAfter=3, bulletText="•"),
    "sub_bullet": S("sub_bullet",
        fontName="Helvetica", fontSize=9, leading=13,
        textColor=MUTED, leftIndent=28, bulletIndent=14,
        spaceAfter=2, bulletText="–"),
    "code": S("code",
        fontName="Courier", fontSize=8.5, leading=13,
        textColor=MID, backColor=colors.HexColor("#F9FAFB"),
        leftIndent=12, spaceAfter=6),
    "label": S("label",
        fontName="Helvetica-Bold", fontSize=7.5, leading=10,
        textColor=BRAND, spaceAfter=2, spaceBefore=8),
    "caption": S("caption",
        fontName="Helvetica", fontSize=8, leading=11,
        textColor=MUTED, alignment=TA_CENTER, spaceAfter=6),
    "toc_item": S("toc_item",
        fontName="Helvetica", fontSize=10, leading=16,
        textColor=MID, leftIndent=0),
    "toc_section": S("toc_section",
        fontName="Helvetica-Bold", fontSize=10, leading=16,
        textColor=DARK, leftIndent=0),
    "quote": S("quote",
        fontName="Helvetica-Oblique", fontSize=11, leading=17,
        textColor=BRAND, leftIndent=16, rightIndent=16,
        spaceBefore=8, spaceAfter=8),
    "tag_in": S("tag_in",
        fontName="Helvetica-Bold", fontSize=8, leading=11,
        textColor=GREEN_TEXT, spaceAfter=0),
    "tag_out": S("tag_out",
        fontName="Helvetica-Bold", fontSize=8, leading=11,
        textColor=RED_TEXT, spaceAfter=0),
}

# ── Helpers ────────────────────────────────────────────────────────────────────
def rule(color=BORDER, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=6, spaceBefore=6)

def gap(h=6):
    return Spacer(1, h)

def label_pill(text):
    return Paragraph(text.upper(), styles["label"])

def body(text):
    return Paragraph(text, styles["body"])

def bold(text):
    return Paragraph(text, styles["body_bold"])

def bullet(text):
    return Paragraph(text, styles["bullet"])

def sub_bullet(text):
    return Paragraph(text, styles["sub_bullet"])

def h1(text):
    return Paragraph(text, styles["h1"])

def h2(text):
    return Paragraph(text, styles["h2"])

def h3(text):
    return Paragraph(text, styles["h3"])

def section_label(num, title):
    return [
        Paragraph(f"SECTION {num}", styles["section_num"]),
        Paragraph(title, styles["h1"]),
        rule(BRAND, 1.5),
        gap(4),
    ]

def callout(text, bg=ACCENT, text_color=BRAND_DARK):
    data = [[Paragraph(text, ParagraphStyle("cb",
        fontName="Helvetica", fontSize=9.5, leading=14,
        textColor=text_color))]]
    t = Table(data, colWidths=[W - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("ROUNDEDCORNERS", [6,6,6,6]),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
    ]))
    return [t, gap(8)]

def kv_table(rows, col_widths=None):
    """Simple two-column key-value table."""
    if col_widths is None:
        col_widths = [5 * cm, W - 2 * MARGIN - 5 * cm]
    data = []
    for k, v in rows:
        data.append([
            Paragraph(k, ParagraphStyle("kk", fontName="Helvetica-Bold",
                fontSize=9, leading=13, textColor=DARK)),
            Paragraph(v, ParagraphStyle("vv", fontName="Helvetica",
                fontSize=9, leading=13, textColor=MID)),
        ])
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), ACCENT),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    return [t, gap(8)]

def grid_table(headers, rows, col_widths=None, stripe=True):
    """General-purpose grid table."""
    if col_widths is None:
        n = len(headers)
        col_widths = [(W - 2 * MARGIN) / n] * n

    header_style = ParagraphStyle("th", fontName="Helvetica-Bold",
        fontSize=8.5, leading=12, textColor=WHITE)
    cell_style   = ParagraphStyle("td", fontName="Helvetica",
        fontSize=8.5, leading=12, textColor=MID)

    data = [[Paragraph(h, header_style) for h in headers]]
    for i, row in enumerate(rows):
        data.append([Paragraph(str(c), cell_style) for c in row])

    ts = [
        ("BACKGROUND", (0,0), (-1,0), BRAND),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 7),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]
    if stripe:
        for i in range(1, len(data)):
            if i % 2 == 0:
                ts.append(("BACKGROUND", (0,i), (-1,i), ACCENT))

    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle(ts))
    return [t, gap(8)]

def check_table(headers, rows, col_widths=None):
    """Table where ✅ / ❌ cells get coloured backgrounds."""
    if col_widths is None:
        n = len(headers)
        cw = (W - 2 * MARGIN)
        col_widths = [cw * 0.35] + [cw * 0.65 / (n-1)] * (n-1)

    header_style = ParagraphStyle("th2", fontName="Helvetica-Bold",
        fontSize=8.5, leading=12, textColor=WHITE)

    def cell_p(text):
        if text in ("✅", "✓"):
            return Paragraph(text, ParagraphStyle("yes", fontName="Helvetica-Bold",
                fontSize=9, leading=12, textColor=GREEN_TEXT, alignment=TA_CENTER))
        elif text in ("❌", "✗"):
            return Paragraph(text, ParagraphStyle("no", fontName="Helvetica-Bold",
                fontSize=9, leading=12, textColor=RED_TEXT, alignment=TA_CENTER))
        else:
            return Paragraph(text, ParagraphStyle("norm", fontName="Helvetica",
                fontSize=8.5, leading=12, textColor=MID))

    data = [[Paragraph(h, header_style) for h in headers]]
    for row in rows:
        data.append([cell_p(str(c)) for c in row])

    ts = [
        ("BACKGROUND", (0,0), (-1,0), BRAND),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]
    for i, row in enumerate(rows, start=1):
        for j, cell in enumerate(row):
            if cell == "✅":
                ts.append(("BACKGROUND", (j,i), (j,i), GREEN_SOFT))
            elif cell == "❌":
                ts.append(("BACKGROUND", (j,i), (j,i), RED_SOFT))
            elif i % 2 == 0:
                ts.append(("BACKGROUND", (j,i), (j,i), ACCENT))

    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle(ts))
    return [t, gap(8)]

def persona_card(icon, role, name, desc, jobs):
    content = [
        Paragraph(f"{icon}  {role}", ParagraphStyle("pc_role",
            fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=BRAND)),
        Paragraph(name, ParagraphStyle("pc_name",
            fontName="Helvetica", fontSize=9, leading=12, textColor=MUTED)),
        gap(6),
        Paragraph(desc, ParagraphStyle("pc_desc",
            fontName="Helvetica", fontSize=9, leading=13, textColor=MID)),
        gap(6),
        Paragraph("Key jobs to be done:", ParagraphStyle("pc_jobs",
            fontName="Helvetica-Bold", fontSize=8.5, leading=12, textColor=DARK)),
    ] + [Paragraph(j, ParagraphStyle("pc_j",
            fontName="Helvetica", fontSize=8.5, leading=12, textColor=MID,
            leftIndent=10, bulletIndent=0, bulletText="•")) for j in jobs]

    data = [content]
    t = Table([[content]], colWidths=[W - 2*MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), ACCENT),
        ("BOX", (0,0), (-1,-1), 1, BRAND),
        ("TOPPADDING", (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("LEFTPADDING", (0,0), (-1,-1), 16),
        ("RIGHTPADDING", (0,0), (-1,-1), 16),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    return [t, gap(10)]

def journey_step(num, title, steps):
    items = [Paragraph(f"<b>{num}. {title}</b>", ParagraphStyle("js_title",
        fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=BRAND))]
    for s in steps:
        items.append(Paragraph(s, ParagraphStyle("js_step",
            fontName="Helvetica", fontSize=9, leading=13, textColor=MID,
            leftIndent=14, bulletIndent=0, bulletText="→")))
    return items

def feature_block(title, description, requirements):
    items = [
        h3(title),
        body(f"<i>{description}</i>"),
        gap(4),
    ] + [bullet(r) for r in requirements] + [gap(4)]
    return items

def pricing_tier(name, price, color, features, col_width):
    rows = [[Paragraph(name, ParagraphStyle("pt_name",
                fontName="Helvetica-Bold", fontSize=11, leading=14,
                textColor=WHITE, alignment=TA_CENTER)),
             Paragraph(price, ParagraphStyle("pt_price",
                fontName="Helvetica", fontSize=9, leading=12,
                textColor=colors.HexColor("#BFD1FF"), alignment=TA_CENTER))]]
    t = Table(rows, colWidths=[col_width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), color),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    return t

# ── Cover page ─────────────────────────────────────────────────────────────────
class CoverPage(Flowable):
    def __init__(self):
        Flowable.__init__(self)
        self._w = W - 2 * MARGIN
        self._h = H - 2 * MARGIN

    def wrap(self, avail_width, avail_height):
        self._w = avail_width
        self._h = avail_height
        return (avail_width, avail_height)

    def draw(self):
        c = self.canv
        w, h = self._w, self._h

        # Background
        c.setFillColor(colors.HexColor("#0F2167"))
        c.rect(0, 0, w, h, fill=1, stroke=0)

        # Decorative circles top-right
        c.setFillColor(colors.HexColor("#1A3A8A"))
        c.circle(w - 20, h - 20, 160, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#1239A6"))
        c.circle(w, h - 50, 90, fill=1, stroke=0)

        # Bottom accent bar
        c.setFillColor(BRAND)
        c.rect(0, 0, w, 8, fill=1, stroke=0)

        # Logo / brand mark
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(16, h - 30, "AssetFlow")
        c.setFillColor(colors.HexColor("#93C5FD"))
        c.setFont("Helvetica", 9)
        c.drawString(16, h - 46, "Asset Management Platform")

        # Divider
        c.setStrokeColor(colors.HexColor("#1A56DB"))
        c.setLineWidth(0.5)
        c.line(16, h - 58, w - 16, h - 58)

        # Main title
        mid_y = h * 0.52
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 38)
        c.drawString(16, mid_y, "Product Requirements")
        c.drawString(16, mid_y - 48, "Document")

        # Subtitle
        c.setFillColor(colors.HexColor("#BFD1FF"))
        c.setFont("Helvetica", 15)
        c.drawString(16, mid_y - 76, "MVP — v1.0")

        # Tag pill
        c.setFillColor(BRAND)
        c.roundRect(16, mid_y - 108, 128, 20, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(26, mid_y - 102, "B2B · MANUFACTURING SME")

        # Meta info
        meta = [
            ("Version", "1.0"),
            ("Date", "April 23, 2026"),
            ("Status", "Draft"),
            ("Segment", "Manufacturing SMEs (10–500 employees)"),
            ("Platform", "Web App + Mobile PWA"),
            ("Model", "Per-Seat SaaS + Enterprise"),
        ]
        y = mid_y - 140
        for key, val in meta:
            c.setFillColor(colors.HexColor("#93C5FD"))
            c.setFont("Helvetica-Bold", 8)
            c.drawString(16, y, key.upper() + ":")
            c.setFillColor(colors.HexColor("#E0EAFF"))
            c.setFont("Helvetica", 8)
            c.drawString(106, y, val)
            y -= 15

        # Footer
        c.setFillColor(colors.HexColor("#4B6CB7"))
        c.setFont("Helvetica", 7.5)
        c.drawString(16, 18, "Confidential — Internal Use Only · AssetFlow Inc. © 2026")

# ── Page template ──────────────────────────────────────────────────────────────
def header_footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        # Header
        canvas.setFillColor(DARK)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(MARGIN, H - 1.2 * cm, "AssetFlow MVP — Product Requirements Document")
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(W - MARGIN, H - 1.2 * cm, f"v1.0 · April 2026")
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, H - 1.4 * cm, W - MARGIN, H - 1.4 * cm)

        # Footer
        canvas.line(MARGIN, 1.4 * cm, W - MARGIN, 1.4 * cm)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(MARGIN, 0.9 * cm, "Confidential — Internal Use Only")
        canvas.drawRightString(W - MARGIN, 0.9 * cm, f"Page {doc.page}")
    canvas.restoreState()

# ── Build document ─────────────────────────────────────────────────────────────
def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=1.8 * cm, bottomMargin=1.8 * cm,
        title="AssetFlow MVP — PRD",
        author="AssetFlow Product Team",
    )

    story = []

    # ── Cover ──────────────────────────────────────────────────────────────────
    story.append(CoverPage())
    story.append(PageBreak())

    # ── Table of Contents ──────────────────────────────────────────────────────
    story += [h1("Table of Contents"), rule(BRAND, 1.5), gap(8)]
    toc = [
        ("1", "Executive Summary"),
        ("2", "Product Vision & Goals"),
        ("3", "Market Context"),
        ("4", "User Personas"),
        ("5", "User Journeys"),
        ("6", "Feature Specifications"),
        ("7", "Role × Feature Matrix"),
        ("8", "Technical Requirements"),
        ("9", "Pricing & Business Model"),
        ("10", "MVP Timeline & Milestones"),
    ]
    for num, title in toc:
        story.append(Paragraph(
            f"<b>{num}.</b>  {title}",
            ParagraphStyle("toc", fontName="Helvetica", fontSize=10.5, leading=20, textColor=MID)))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 1: Executive Summary
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("1", "Executive Summary")

    story += [h2("Problem Statement")]
    story += [body(
        "Manufacturing SMEs (10–500 employees) are losing money to unplanned equipment downtime, "
        "lost tools, and missed maintenance windows. Most track assets via spreadsheets or "
        "paper-based systems. Enterprise solutions like IBM Maximo and SAP are too expensive, "
        "too complex, and too slow to implement for this segment."
    ), gap(4)]

    story += [h2("Solution")]
    story += [body(
        "AssetFlow is a SaaS asset management platform built specifically for manufacturing SMEs. "
        "It combines asset inventory tracking and preventive maintenance scheduling in a single, "
        "easy-to-use web and mobile PWA — no installation required, no IT team needed."
    ), gap(4)]

    story += [h2("Market Opportunity")]
    story += grid_table(
        ["Metric", "Data"],
        [
            ["Global market size by 2028", "$32.2 billion (CAGR 10.1% — Grand View Research)"],
            ["Highest demand vertical", "Manufacturing & Industrial"],
            ["Primary gap", "Existing tools are too expensive (enterprise) or too generic (SME)"],
            ["Target addressable market", "~2.5M manufacturing SMEs in North America + Europe"],
            ["BFSI market share (2025)", "22.81% revenue share — largest single segment"],
            ["Healthcare growth", "7.88% CAGR through 2031 — best expansion target for v2"],
        ],
        col_widths=[7*cm, W - 2*MARGIN - 7*cm]
    )

    story += [h2("Business Model Summary")]
    for b_text in [
        "Per-seat SaaS subscription — Starter and Pro tiers billed monthly or annually",
        "Enterprise plan sold via direct sales with custom pricing and dedicated support",
        "Revenue model: Monthly Recurring Revenue (MRR) with annual contract option for enterprise",
    ]:
        story.append(bullet(b_text))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 2: Product Vision & Goals
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("2", "Product Vision & Goals")

    story += [h2("Vision Statement")]
    t = Table([[Paragraph(
        '"Give every manufacturing team the visibility and control over their physical assets '
        'that only large enterprises could afford before — at a price any SME can justify."',
        ParagraphStyle("vision", fontName="Helvetica-Oblique", fontSize=12, leading=18,
                       textColor=BRAND_DARK))]],
        colWidths=[W - 2*MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), ACCENT),
        ("LEFTPADDING", (0,0), (-1,-1), 18),
        ("RIGHTPADDING", (0,0), (-1,-1), 18),
        ("TOPPADDING", (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("BOX", (0,0), (-1,-1), 2, BRAND),
    ]))
    story += [t, gap(10)]

    story += [h2("MVP Objectives")]
    for obj in [
        "Allow any manufacturing SME to register, tag, and track all physical assets in under one hour",
        "Enable technicians to scan assets in the field and log maintenance work from their phone",
        "Give managers a live dashboard to monitor asset health and upcoming maintenance",
        "Automate maintenance reminders to prevent unplanned downtime",
    ]:
        story.append(bullet(obj))

    story += [h2("Success Metrics — 6 Months Post-Launch")]
    story += grid_table(
        ["Metric", "Target"],
        [
            ["Monthly Active Customers", "50 paying businesses"],
            ["Average Seats per Customer", "8 users"],
            ["Monthly Recurring Revenue", "$25,000 MRR"],
            ["Churn Rate", "< 5% monthly"],
            ["Asset Scan Actions / Day", "500+ across all customers"],
            ["Maintenance Tasks Completed On-Time", "> 80%"],
            ["NPS Score", "> 40"],
        ],
        col_widths=[9*cm, W - 2*MARGIN - 9*cm]
    )

    story += [h2("Out of Scope — MVP")]
    out_items = [
        "Third-party integrations (QuickBooks, Slack, SAP, REST API)",
        "Native iOS or Android app (PWA covers mobile for MVP)",
        "B2C individual tracking features",
        "AI-powered predictive maintenance",
        "Multi-site enterprise hierarchy beyond basic org management",
        "Offline mode (requires connectivity for MVP)",
    ]
    for item in out_items:
        story.append(bullet(f"<font color='#991B1B'>✗</font>  {item}"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 3: Market Context
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("3", "Market Context")

    story += [h2("Target Customer")]
    story += kv_table([
        ("Primary segment", "Manufacturing and industrial SMEs with physical equipment, machinery, vehicles, or tools"),
        ("Company size", "10–500 employees"),
        ("Geography", "North America (primary), English-speaking markets (secondary)"),
        ("Budget authority", "Operations Manager, Plant Manager, or Business Owner"),
        ("Current state", "Managing assets in spreadsheets, paper logs, or nothing at all"),
    ], col_widths=[5*cm, W - 2*MARGIN - 5*cm])

    story += [h2("Competitive Landscape")]
    story += grid_table(
        ["Competitor", "Strength", "Weakness", "AssetFlow Advantage"],
        [
            ["IBM Maximo", "Feature-rich, enterprise-grade", "$100K+ implementation, 6-month setup", "10x cheaper, same-day setup"],
            ["UpKeep", "Mobile-first, easy to use", "Maintenance-only, weak asset registry", "Unified registry + maintenance"],
            ["Fiix", "Good maintenance scheduling", "Complex UI, steep learning curve", "Simpler UX, faster onboarding"],
            ["Limble CMMS", "Great for maintenance teams", "No GPS, limited asset tracking", "GPS tracking + full asset registry"],
            ["Spreadsheets", "Free, familiar", "No automation, error-prone, no mobile", "Automated alerts + mobile scanning"],
        ],
        col_widths=[3.2*cm, 3.8*cm, 4.2*cm, 4.8*cm]
    )

    story += [h2("Positioning Statement")]
    story += callout(
        "AssetFlow is the only asset management tool built for manufacturing SMEs that combines "
        "physical asset tracking (registry, QR/barcode scanning, GPS) with preventive maintenance "
        "scheduling in a single platform — accessible from desktop and mobile without an app store install."
    )
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 4: User Personas
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("4", "User Personas")
    story.append(body("AssetFlow serves three distinct roles within a manufacturing organisation. "
                      "Each persona has different goals, frustrations, and daily workflows."))
    story.append(gap(8))

    story += persona_card(
        "🏢", "Admin — Operations Manager",
        "Sarah, 42 · 80-person metal fabrication company",
        "Wants a single source of truth for all equipment — what they own, where it is, and when it needs servicing. "
        "Currently drowning in spreadsheets that go out of date the moment they are shared.",
        [
            "Register all company assets once (bulk import or one-by-one)",
            "Assign assets to locations, departments, or individuals",
            "Configure maintenance schedules for each asset type",
            "Manage user accounts and permissions",
            "View audit history for compliance",
        ]
    )

    story += persona_card(
        "🔧", "Technician — Field Worker",
        "Marcus, 28 · Equipment Technician",
        "Needs to know what maintenance tasks are due today and log completion quickly — without paperwork. "
        "Currently gets paper work orders that get lost and has no easy way to find asset history on the floor.",
        [
            "Scan a QR code on a machine and immediately see its history and next service date",
            "Log a completed maintenance task in under 60 seconds",
            "Report an issue or flag an asset as out of service",
            "View assigned work orders for the day",
        ]
    )

    story += persona_card(
        "📊", "Manager — Plant Manager",
        "David, 55 · Plant Manager",
        "Wants to prevent downtime and know at a glance which assets are healthy, overdue, or flagged. "
        "Only finds out about equipment problems after a breakdown. Manual reports from spreadsheets take hours.",
        [
            "View a dashboard showing asset health status across the facility",
            "See upcoming and overdue maintenance tasks",
            "Approve work orders and assign them to technicians",
            "Export a monthly maintenance report for the board",
        ]
    )
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 5: User Journeys
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("5", "User Journeys")

    # Admin
    story += [h2("5.1  Admin Journey — Onboarding & Setup")]
    admin_steps = [
        ("Sign Up", ["Creates account, sets up company profile (name, industry, location)"]),
        ("Add Assets", ["Imports assets via CSV upload or adds individually",
                        "Assigns each asset: name, category, serial number, location, purchase date"]),
        ("Generate QR / Barcode Labels", ["System generates printable QR codes for each asset",
                                          "Admin prints and physically attaches labels to equipment"]),
        ("Configure Maintenance Schedules", ["Sets recurring maintenance tasks per asset or asset category",
                                              "Defines interval (daily, weekly, monthly, by usage hours)",
                                              "Assigns default technician responsible"]),
        ("Invite Team", ["Sends email invites to Technicians and Managers",
                         "Assigns roles and permissions per user"]),
        ("Verify Setup", ["Reviews asset list, scans a test QR code, confirms alerts are working"]),
    ]
    for num, (title, steps) in enumerate(admin_steps, 1):
        story += journey_step(num, title, steps)
        story.append(gap(4))

    story += [gap(10), h2("5.2  Technician Journey — Daily Work")]
    tech_steps = [
        ("Start of Shift", ["Opens AssetFlow on mobile browser (PWA)",
                            "Views 'My Work Orders' — tasks assigned for today"]),
        ("Scan an Asset", ["Taps 'Scan Asset' — camera opens",
                           "Scans QR code on machine",
                           "Sees asset profile: name, location, last service date, status, open issues"]),
        ("Log Maintenance", ["Taps 'Log Maintenance' on the asset",
                             "Selects task type (from predefined list or free text)",
                             "Adds notes, photos (optional), marks duration",
                             "Submits — work order auto-closes if linked"]),
        ("Report an Issue", ["Taps 'Report Issue' on scanned asset",
                             "Selects severity (Low / Medium / Critical)",
                             "Adds description and photo",
                             "Submits — manager gets alert immediately for Critical issues"]),
        ("End of Shift", ["Views completion status of assigned tasks",
                          "Any incomplete tasks automatically flagged for manager"]),
    ]
    for num, (title, steps) in enumerate(tech_steps, 1):
        story += journey_step(num, title, steps)
        story.append(gap(4))

    story += [gap(10), h2("5.3  Manager Journey — Monitoring & Oversight")]
    mgr_steps = [
        ("Morning Dashboard Review", ["Opens AssetFlow on desktop browser",
                                       "Sees summary: total assets, assets due for maintenance, overdue count, open issues",
                                       "Red/amber/green status indicators per asset category"]),
        ("Review Upcoming Maintenance", ["Views maintenance calendar — next 7 / 30 days",
                                          "Sees which tasks are assigned, unassigned, or overdue",
                                          "Reassigns or approves work orders as needed"]),
        ("Respond to Alerts", ["Receives email/in-app alert for critical issues or overdue tasks",
                                "Reviews issue details, adds notes, changes priority",
                                "Assigns or escalates to another technician"]),
        ("Monthly Reporting", ["Navigates to Reports section",
                                "Views maintenance completion rate, asset downtime events, work order history",
                                "Exports PDF or on-screen summary for board/management review"]),
    ]
    for num, (title, steps) in enumerate(mgr_steps, 1):
        story += journey_step(num, title, steps)
        story.append(gap(4))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 6: Feature Specifications
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("6", "Feature Specifications")

    features = [
        ("6.1  Asset Registry & Management",
         "Central database of all company assets with full profile per asset.",
         [
             "Each asset record contains: name, asset ID (auto-generated), category, serial number, manufacturer, model, purchase date, purchase cost, warranty expiry, location, assigned user, status, and custom fields (Admin-configurable key-value pairs, up to 10 per asset)",
             "Bulk import via CSV with field mapping wizard",
             "Asset categories are user-configurable (e.g., Machinery, Vehicles, Tools, IT Equipment)",
             "Assets can be linked to a physical location (building, floor, zone) defined by Admin",
             "Full edit history per asset (who changed what and when)",
             "Asset duplication for creating similar assets quickly",
             "Archive/retire assets without deletion (preserves history)",
             "Search and filter by any field; sortable columns in list view",
         ]),
        ("6.2  QR / Barcode Scanning",
         "Camera-based scanning on mobile PWA to identify assets instantly in the field.",
         [
             "Admin generates a unique QR code per asset — printable, downloadable as PNG or PDF sheet",
             "Technician taps 'Scan' in mobile browser — uses device camera (no app install needed)",
             "Scanning opens the asset profile immediately",
             "System also accepts manual asset ID entry as fallback",
             "QR codes are permanent and tied to the asset ID (survive asset edits)",
             "Batch QR label printing: print labels for multiple assets at once (Avery-compatible sheet layout)",
             "Compatible with standard USB barcode scanners for fixed workstations",
         ]),
        ("6.3  GPS / Location Tracking",
         "Track the physical location of mobile assets using browser GPS. Available on Pro and Enterprise plans only.",
         [
             "When a Technician scans or checks in an asset from their mobile device, GPS coordinates are optionally recorded",
             "Admin can view last known location of each asset on an embedded map view (OpenStreetMap / Leaflet.js)",
             "Location history log per asset (timestamp + coordinates)",
             "GPS is opt-in: Technician is prompted for location permission on first use",
             "Assets can have a fixed 'home location' defined by Admin for reference",
             "Location capture only occurs on user action (scan or check-in), not continuous background tracking",
         ]),
        ("6.4  Maintenance Scheduling",
         "Define recurring preventive maintenance tasks per asset and track completion.",
         [
             "Admin creates maintenance schedules per asset or asset category",
             "Schedule types: time-based (every N days/weeks/months) or usage-based (every N hours — Technician manually logs current hours when completing a work order; Admin sets the threshold)",
             "Each schedule defines: task name, description, estimated duration, assigned technician (default), and priority",
             "System auto-generates work orders based on schedule — N days before due date (configurable lead time)",
             "Maintenance calendar view: month/week/day views showing upcoming and overdue tasks",
             "Maintenance history per asset: complete log of all past tasks with timestamps and technician notes",
             "Bulk schedule assignment: apply a maintenance template to an entire asset category",
         ]),
        ("6.5  Work Order Management",
         "Task-level tracking for maintenance and repair jobs from creation to completion.",
         [
             "Work orders can be auto-generated (from maintenance schedule) or manually created by Admin/Manager",
             "Work order fields: title, asset linked, assigned technician, due date, priority (Low/Medium/High/Critical), description, estimated hours, status",
             "Status flow: Open → In Progress → Completed / Cancelled",
             "Technician updates status and adds completion notes from mobile",
             "Photo attachments per work order (up to 5 photos, max 10MB each)",
             "Manager can add comments or reassign at any stage",
             "Overdue work orders automatically escalate (change to red status + notification)",
             "Work order history retained indefinitely per asset",
         ]),
        ("6.6  Automated Alerts & Notifications",
         "Proactive notifications to prevent missed maintenance and surface critical issues.",
         [
             "In-app notifications (bell icon + notification feed) and email notifications (HTML formatted, configurable per user)",
             "Triggers: Maintenance due in N days · Work order overdue · Critical issue reported · Asset status changed · Work order assigned to technician",
             "Users configure their own notification preferences (which events, in-app vs email)",
             "Admin can set org-level defaults for notification rules",
             "No SMS or push notifications in MVP (email + in-app only)",
         ]),
        ("6.7  Dashboard & Reporting",
         "Real-time visibility into asset health and maintenance performance for Managers.",
         [
             "Dashboard widgets: Total assets by status · Maintenance due this week/month · Overdue maintenance count · Open work orders by priority · Recent activity feed · Assets with open critical issues",
             "Reports: Maintenance completion rate · Asset downtime log · Work order history (filterable) · Full asset inventory export",
             "All reports exportable as PDF or CSV",
         ]),
        ("6.8  User Management & Roles",
         "Role-based access control with three permission levels.",
         [
             "Admin invites users via email; invited users set their own password",
             "Each seat = one active user account",
             "Admins can deactivate users (frees up the seat without deleting history)",
             "Each company account is isolated — no cross-company data access",
             "Three roles: Admin (full access) · Manager (operational) · Technician (field tasks only)",
         ]),
    ]

    for title, desc, reqs in features:
        story += feature_block(title, desc, reqs)
        if title != features[-1][0]:
            story.append(rule())
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 7: Role × Feature Matrix
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("7", "Role × Feature Matrix")
    story += check_table(
        ["Feature", "Admin", "Manager", "Technician"],
        [
            ["Asset Registry",            "Full access",         "Read only",           "Read only (via scan)"],
            ["QR Code Generation",        "✅",                  "❌",                  "❌"],
            ["GPS Location View",         "✅",                  "✅",                  "Logs own location"],
            ["Maintenance Scheduling",    "✅",                  "Create & edit",       "View assigned"],
            ["Work Orders",               "Full CRUD",           "Create & assign",     "Update & complete"],
            ["Issue Reporting",           "✅",                  "✅",                  "✅"],
            ["Manager Dashboard",         "✅",                  "✅",                  "❌"],
            ["Reports & Exports",         "✅",                  "✅",                  "❌"],
            ["User Management",           "✅",                  "❌",                  "❌"],
            ["Notification Config",       "Org-wide",            "Own settings",        "Own settings"],
            ["Billing & Subscription",    "✅",                  "❌",                  "❌"],
        ],
        col_widths=[5.5*cm, 3.5*cm, 3.5*cm, 3.5*cm]
    )
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 8: Technical Requirements
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("8", "Technical Requirements")

    story += [h2("Platform")]
    story += grid_table(
        ["Requirement", "Specification"],
        [
            ["Deployment", "SaaS, cloud-hosted"],
            ["Web App", "Responsive web application (desktop-first, mobile-compatible)"],
            ["Mobile", "Progressive Web App (PWA) — installable from browser, no app store"],
            ["Offline support", "None (MVP requires connectivity)"],
            ["Browser support", "Chrome, Firefox, Safari, Edge (latest 2 major versions)"],
            ["QR Scanning", "Browser camera API (getUserMedia) — no native app required"],
            ["GPS", "Browser Geolocation API (permission-based, user-triggered)"],
            ["Map display", "Embedded map via OpenStreetMap / Leaflet.js"],
            ["Authentication", "Email + password with secure session management; MFA optional"],
            ["Data storage", "Cloud database, multi-tenant with strict tenant isolation"],
            ["File storage", "Cloud object storage for photos and QR label PDFs"],
        ],
        col_widths=[5*cm, W - 2*MARGIN - 5*cm]
    )

    story += [h2("Performance Targets")]
    story += grid_table(
        ["Metric", "Target"],
        [
            ["Page load time (web)", "< 2 seconds (P90)"],
            ["QR scan to asset profile", "< 1 second"],
            ["Dashboard load", "< 3 seconds"],
            ["API response time", "< 500ms (P95)"],
            ["Uptime SLA", "99.5% monthly"],
        ],
        col_widths=[7*cm, W - 2*MARGIN - 7*cm]
    )

    story += [h2("Security Requirements")]
    for req in [
        "All data encrypted in transit (TLS 1.2+) and at rest (AES-256)",
        "Tenant data strictly isolated — no cross-account data leakage possible",
        "Role-based access enforced server-side (not just at the UI layer)",
        "Password requirements: minimum 8 characters, enforced on create/reset",
        "Session timeout after 24 hours of inactivity",
        "Audit log for all data changes (who, what, when) — retained 12 months",
    ]:
        story.append(bullet(req))

    story += [gap(6), h2("Scalability")]
    story += grid_table(
        ["Constraint", "Limit"],
        [
            ["Concurrent users", "Up to 10,000 at MVP launch"],
            ["Assets per tenant", "Up to 100,000 asset records"],
            ["Storage per tenant", "Up to 50GB for photo attachments"],
        ],
        col_widths=[7*cm, W - 2*MARGIN - 7*cm]
    )
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 9: Pricing & Business Model
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("9", "Pricing & Business Model")

    story += [h2("Subscription Tiers")]
    story += check_table(
        ["Feature", "Starter  $15/user/mo", "Pro  $28/user/mo", "Enterprise  Custom"],
        [
            ["Minimum seats",           "3",    "5",    "20"],
            ["Asset limit",             "200",  "Unlimited", "Unlimited"],
            ["User limit",              "10",   "Unlimited", "Unlimited"],
            ["QR / Barcode Scanning",   "✅",   "✅",   "✅"],
            ["GPS Tracking",            "❌",   "✅",   "✅"],
            ["Maintenance Scheduling",  "✅",   "✅",   "✅"],
            ["Work Orders",             "✅",   "✅",   "✅"],
            ["Reporting & Export",      "Basic","Full", "Full + Custom"],
            ["Support",                 "Email","Priority email", "Dedicated CSM"],
            ["SLA",                     "99.5%","99.5%","99.9%"],
            ["Onboarding",              "Self-serve","Self-serve","White-glove setup"],
            ["Contract",                "Monthly","Monthly / Annual","Annual"],
        ],
        col_widths=[5*cm, 3.5*cm, 3.5*cm, 4*cm]
    )

    story += [h2("Enterprise Plan Details")]
    for item in [
        "Sold via direct sales (outbound + inbound from website)",
        "Custom pricing based on seat count, asset volume, and contract length",
        "Includes: dedicated Customer Success Manager, custom onboarding and data migration, priority support with 4-hour SLA",
        "Annual contract with Net-30 invoicing and volume discounts for 50+ seats",
    ]:
        story.append(bullet(item))

    story += [gap(8), h2("Revenue Projections — Month 6")]
    story += grid_table(
        ["Tier", "Customers", "Avg Seats", "MRR"],
        [
            ["Starter", "30", "5", "$2,250"],
            ["Pro", "15", "10", "$4,200"],
            ["Enterprise", "3", "25", "$7,500+"],
            ["Total", "48", "—", "~$14,000–$25,000"],
        ],
        col_widths=[4*cm, 3.5*cm, 3.5*cm, 5*cm]
    )
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 10: MVP Timeline & Milestones
    # ══════════════════════════════════════════════════════════════════════════
    story += section_label("10", "MVP Timeline & Milestones")

    story += [h2("6-Month Build Plan")]
    story += grid_table(
        ["Phase", "Duration", "Deliverables"],
        [
            ["Phase 1: Foundation", "Weeks 1–4", "Auth system, company onboarding, asset registry (CRUD), basic user management"],
            ["Phase 2: Scanning & Tracking", "Weeks 5–8", "QR code generation, camera-based PWA scanning, GPS location capture, map view"],
            ["Phase 3: Maintenance Core", "Weeks 9–12", "Maintenance scheduling engine, work order creation & assignment, status flows"],
            ["Phase 4: Alerts & Dashboard", "Weeks 13–16", "Email + in-app notifications, manager dashboard, alert rules"],
            ["Phase 5: Reports & Polish", "Weeks 17–20", "Reporting module, PDF/CSV export, mobile PWA polish, performance tuning"],
            ["Phase 6: Launch Prep", "Weeks 21–24", "Security audit, billing integration (Stripe), pricing page, onboarding flow, beta testing with 3–5 design partners"],
        ],
        col_widths=[4.5*cm, 3*cm, W - 2*MARGIN - 7.5*cm]
    )

    story += [h2("Key Milestones")]
    milestones = [
        ("Week 4",  "Internal demo of core asset registry — validate with 2 potential customers"),
        ("Week 8",  "First QR scan working end-to-end on mobile"),
        ("Week 12", "First complete maintenance work order lifecycle demo"),
        ("Week 20", "Feature-complete beta ready for design partners"),
        ("Week 24", "Public launch — Starter and Pro plans live"),
    ]
    for week, desc_text in milestones:
        story.append(Paragraph(
            f"<b>{week}:</b>  {desc_text}",
            ParagraphStyle("ms", fontName="Helvetica", fontSize=9.5, leading=15,
                           textColor=MID, leftIndent=14, bulletIndent=0, bulletText="◆",
                           spaceAfter=5)))

    story += [gap(10), h2("Go-To-Market")]
    for item in [
        "Launch on Product Hunt + relevant manufacturing communities (r/manufacturing, r/lean)",
        "Outbound to manufacturing SMEs via LinkedIn Sales Navigator",
        "Content marketing: 'The spreadsheet-to-AssetFlow migration guide'",
        "Design partner program: 5 early customers get 6 months free in exchange for feedback and case studies",
        "Enterprise leads handled by founder directly at launch",
    ]:
        story.append(bullet(item))

    story += [gap(16), rule(BORDER, 0.5)]
    story.append(Paragraph(
        "Document prepared for internal product planning and investor review. "
        "All projections are estimates based on market research and comparable SaaS benchmarks.",
        ParagraphStyle("footer_note", fontName="Helvetica", fontSize=8,
                       leading=12, textColor=MUTED, alignment=TA_CENTER)))

    # ── Build ──────────────────────────────────────────────────────────────────
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"PDF written to: {OUTPUT}")

if __name__ == "__main__":
    build()
