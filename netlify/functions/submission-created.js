const nodemailer = require('nodemailer');

const TARGET_FORM_NAME = '申し込みフォーム';

function formatDateTime(value) {
  if (!value) return '未入力';
  return value.replace('T', ' ');
}

function buildEmailBody(data) {
  const name = data['お名前'] || '';
  const pref1 = formatDateTime(data['第一希望日時']);
  const pref2 = formatDateTime(data['第二希望日時']);
  const pref3 = formatDateTime(data['第三希望日時']);
  const message = data['その他'] || 'なし';

  return `${name} 様

この度は「支出改善コーチング」無料個別相談へお申し込みいただき、誠にありがとうございます。
以下の内容で承りました。

――――――――――――――――
お名前：${name}
第一希望日時：${pref1}
第二希望日時：${pref2}
第三希望日時：${pref3}
その他：${message}
――――――――――――――――

内容を確認の上、3営業日以内を目安にご連絡いたします。
稀に迷惑メールフォルダに入っている場合がございますので、あわせてご確認ください。

引き続きよろしくお願いいたします。

ユヤの支出改善コーチング
`;
}

exports.handler = async (event) => {
  try {
    const { payload } = JSON.parse(event.body);

    if (!payload || payload.form_name !== TARGET_FORM_NAME) {
      return { statusCode: 200, body: 'skipped: not the target form' };
    }

    const data = payload.data || {};
    const toEmail = data['メールアドレス'];

    if (!toEmail) {
      console.error('submission-created: メールアドレスが送信データに見つかりません', data);
      return { statusCode: 200, body: 'skipped: no recipient email' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ユヤの支出改善コーチング" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: '【支出改善コーチング】お申し込みありがとうございます',
      text: buildEmailBody(data),
    });

    return { statusCode: 200, body: 'confirmation email sent' };
  } catch (err) {
    console.error('submission-created: unexpected error', err);
    return { statusCode: 200, body: 'error logged' };
  }
};
