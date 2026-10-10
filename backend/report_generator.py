import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_certificate(prediction: str, probability: float, trust_score: float, sentiment: str, content: str, reasons: list):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Center
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#3b82f6'),
        alignment=1,
        spaceAfter=20
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        leading=14
    )

    # Document Header
    story.append(Paragraph("FNDS: FAKE NEWS DETECTION SYSTEM", title_style))
    story.append(Paragraph("OFFICIAL AI VERIFICATION CERTIFICATE", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#3b82f6'), spaceAfter=15))

    # Prediction Summary Box
    status_color = colors.HexColor('#10b981') if prediction.upper() == 'REAL' else colors.HexColor('#ef4444')
    pred_text = f"<font color='{status_color.hexval()}'><b>{prediction.upper()}</b></font>"

    table_data = [
        [Paragraph("<b>CLASSIFICATION RESULT:</b>", body_style), Paragraph(pred_text, body_style)],
        [Paragraph("<b>CONFIDENCE SCORE:</b>", body_style), Paragraph(f"<b>{probability}%</b>", body_style)],
        [Paragraph("<b>TRUST SCORE:</b>", body_style), Paragraph(f"<b>{trust_score} / 10</b>", body_style)],
        [Paragraph("<b>SENTIMENT TONE:</b>", body_style), Paragraph(f"<b>{sentiment}</b>", body_style)],
        [Paragraph("<b>VERIFICATION TIMESTAMP:</b>", body_style), Paragraph(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}", body_style)]
    ]

    t = Table(table_data, colWidths=[180, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Content Analyzed
    story.append(Paragraph("ANALYZED NEWS CONTENT SNIPPET", heading_style))
    snippet = content[:400] + ("..." if len(content) > 400 else "")
    story.append(Paragraph(f"<i>\"{snippet}\"</i>", body_style))
    story.append(Spacer(1, 15))

    # Verification Reasons
    story.append(Paragraph("AI VERIFICATION BREAKDOWN & RISK FLAGS", heading_style))
    if reasons:
        for r in reasons:
            story.append(Paragraph(f"• {r}", body_style))
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph("• Standard structural verification passed cleanly.", body_style))

    story.append(Spacer(1, 25))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=10))
    story.append(Paragraph("FNDS Multi-Layer AI Engine • Certified Verification Output • fnds-ai.org", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    return buffer
