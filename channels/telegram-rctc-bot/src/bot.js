import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Set TELEGRAM_BOT_TOKEN');
  process.exit(1);
}
const repo = process.env.REPO_URL || 'https://github.com/kazoya/rctc-skill';
const portfolio = process.env.PORTFOLIO_URL || 'https://suhib-ai-delivery-portfolio.vercel.app/en';
const coffee = process.env.COFFEE_URL || 'https://buymeacoffee.com/Asrawi612';

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply(
  'أهلاً بك في RCTC Skill Suite.\n' +
  'ابدأ بباقة beginner-coding-path من الريبو:\n' + repo + '\n' +
  'المحفظة: ' + portfolio + '\n' +
  'أوامر: /packages /cert /prompt /support'
));

bot.command('packages', (ctx) => ctx.reply(
  'الباقات:\n' +
  '- beginner-coding-path\n- oss-skill-builder\n- community-agora\n- coffee-pass\n- portfolio-ops\n' +
  'التفاصيل: ' + repo + '/tree/master/packages'
));

bot.command('cert', (ctx) => ctx.reply(
  'أحدث شهادات Agora:\n' +
  repo + '/tree/master/packages/agora-certificates'
));

bot.command('prompt', (ctx) => ctx.reply(
  'FIRST_PROMPT:\n' +
  repo + '/blob/master/packages/agora-certificates/FIRST_PROMPT.md'
));

bot.command('support', (ctx) => ctx.reply(
  'الدعم اختياري بالكامل.\n' +
  'قهوة: ' + coffee + '\n' +
  'أو ستار على GitHub يكفي للتشجيع: ' + repo
));

bot.launch();
console.log('RCTC telegram bot running');
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
