package mail

import (
	"fmt"
	"net/smtp"
	"strings"
)

type Mailer struct {
	host     string
	port     string
	username string
	password string
	from     string
}

func New(host, port, username, password, from string) *Mailer {
	return &Mailer{host: host, port: port, username: username, password: password, from: from}
}

// Enabled reports whether SMTP is configured.
func (m *Mailer) Enabled() bool {
	return m.host != "" && m.username != ""
}

func (m *Mailer) send(to, subject, body string) error {
	if !m.Enabled() {
		return nil
	}
	addr := m.host + ":" + m.port
	auth := smtp.PlainAuth("", m.username, m.password, m.host)

	var buf strings.Builder
	fmt.Fprintf(&buf, "From: AssetFlow <%s>\r\n", m.from)
	fmt.Fprintf(&buf, "To: %s\r\n", to)
	fmt.Fprintf(&buf, "Subject: %s\r\n", subject)
	fmt.Fprintf(&buf, "MIME-Version: 1.0\r\n")
	fmt.Fprintf(&buf, "Content-Type: text/html; charset=UTF-8\r\n")
	fmt.Fprintf(&buf, "\r\n%s", body)

	return smtp.SendMail(addr, auth, m.from, []string{to}, []byte(buf.String()))
}

// SendInvite sends login credentials to a newly invited team member.
func (m *Mailer) SendInvite(to, name, orgName, password string) error {
	subject := fmt.Sprintf("You've been invited to %s on AssetFlow", orgName)
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family: 'Inter Tight', Arial, sans-serif; background:#FAFAF9; margin:0; padding:40px 20px;">
  <div style="max-width:520px; margin:0 auto; background:#fff; border:1px solid #E2E5EA; border-radius:8px; padding:40px;">
    <p style="font-size:12px; font-family:monospace; color:#6B7280; margin:0 0 8px; letter-spacing:0.12em; text-transform:uppercase;">AssetFlow</p>
    <h1 style="font-size:22px; font-weight:600; color:#0E1116; margin:0 0 24px; letter-spacing:-0.015em;">
      You've been invited to %s
    </h1>
    <p style="font-size:14px; color:#4A5260; line-height:1.6; margin:0 0 24px;">
      Hi %s, your account has been created. Use the credentials below to sign in.
    </p>
    <div style="background:#F4F5F7; border-radius:6px; padding:16px 20px; margin-bottom:24px;">
      <p style="margin:0 0 8px; font-size:12px; font-family:monospace; color:#6B7280; letter-spacing:0.08em; text-transform:uppercase;">Your login details</p>
      <p style="margin:0 0 4px; font-size:13px; color:#0E1116;"><strong>Email:</strong> %s</p>
      <p style="margin:0; font-size:13px; color:#0E1116;"><strong>Password:</strong> <span style="font-family:monospace;">%s</span></p>
    </div>
    <p style="font-size:13px; color:#6B7280; margin:0;">
      Please change your password after your first login via Settings.
    </p>
  </div>
</body>
</html>`, orgName, name, to, password)
	return m.send(to, subject, body)
}

// SendPasswordChanged sends a notification when a password is changed.
func (m *Mailer) SendPasswordChanged(to, name string) error {
	subject := "Your AssetFlow password was changed"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family: 'Inter Tight', Arial, sans-serif; background:#FAFAF9; margin:0; padding:40px 20px;">
  <div style="max-width:520px; margin:0 auto; background:#fff; border:1px solid #E2E5EA; border-radius:8px; padding:40px;">
    <p style="font-size:12px; font-family:monospace; color:#6B7280; margin:0 0 8px; letter-spacing:0.12em; text-transform:uppercase;">AssetFlow</p>
    <h1 style="font-size:22px; font-weight:600; color:#0E1116; margin:0 0 24px; letter-spacing:-0.015em;">Password changed</h1>
    <p style="font-size:14px; color:#4A5260; line-height:1.6; margin:0 0 16px;">
      Hi %s, your password was successfully changed.
    </p>
    <p style="font-size:13px; color:#6B7280; margin:0;">
      If you did not make this change, please contact your administrator immediately.
    </p>
  </div>
</body>
</html>`, name)
	return m.send(to, subject, body)
}
