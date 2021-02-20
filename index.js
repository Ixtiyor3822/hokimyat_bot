const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('config');
const token = config.get('token');
const User = require('./model/User');
const Ariza = require('./model/Arizalarim');
const bot = new TelegramBot(token, { polling: true });

const admin = 782904002;
const algoritmchi = 277174357;
const dizayner = 408023667;
const qoshimcha_qism = 930099169;

mongoose.connect('mongodb://localhost/testhokim', { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Bazaga ulanildi'))
    .catch((err) => console.log(err))

console.log('Bot ishga tushdi');

bot.onText(/\/start/, async (msg) => {
    const user = User.findOne({ userid: msg.chat.id })
        .then(user => {

            if ((user.contact != null) && (user.ismi != null) && (user.familiyasi != null) && (user.passport != null)) {
                if (user.userid === admin || user.userid === algoritmchi || user.userid === dizayner || user.userid === qoshimcha_qism) {
                    bot.sendMessage(user.userid, 'Xush kelibsiz', {
                        reply_markup: {
                            keyboard: [
                                ['Bugungi arizalar', 'Arizalar']
                            ],
                            resize_keyboard: true
                        }
                    })
                }
                else {
                    bot.sendMessage(user.userid, 'Xush kelibsiz!', {
                        reply_markup: {
                            keyboard: [
                                ['Ariza berish', 'Arizalarim'],
                                ['Mening ma`lumotlarim']
                            ],
                            resize_keyboard: true
                        }
                    })
                }
            }
            else {
                bot.sendMessage(user.userid, 'Iltimos ma`lumotlaringizni to`liq qiling! /start ni bosing.')
            }
        })
        .catch(async (e) => {
            const user = User({ userid: msg.chat.id, username: msg.chat.username })
            await user.save();
            bot.sendMessage(msg.chat.id, 'Xush kelibsiz!', {
                reply_markup: {
                    keyboard: [
                        ['Keyingisi']
                    ],
                    resize_keyboard: true
                }
            })
        })

});
bot.onText(/Keyingisi/, async (msg) => {
    const user = await User.findOne({ userid: msg.chat.id });
    bot.sendMessage(user.userid, 'Iltimos ismingizni kiriting:', {
        reply_markup: {
            remove_keyboard: true
        }
    })
    bot.once('text', async (msg) => {
        const ism = msg.text.toString();
        user.ismi = ism;
        await user.save()
        bot.sendMessage(user.userid, 'Iltimos familiyangizni kiriting:')
        bot.once('text', async (msg) => {
            const fam = msg.text.toString();
            user.familiyasi = fam;
            await user.save()
            bot.sendMessage(user.userid, 'Iltimos passport seriyangizni kiriting:')
            bot.once('text', async (msg) => {
                const passportseria = msg.text.toString();
                user.passport = passportseria;
                await user.save();
                bot.sendMessage(user.userid, 'Iltimos telefon raqamingizni kiriting:', { reply_markup: { keyboard: [[{ text: 'Kontact yuborish', request_contact: true }]], resize_keyboard: true } })
                bot.once('contact', async (msg) => {
                    const contact = msg.contact.phone_number;
                    user.contact = contact;
                    user.save();
                    bot.sendMessage(user.userid, 'Iltimos shaxsiy ma`lumotlaringizni tekshiring. Ma`lumotlaringiz noto`g`ri bo`lsa arizangiz qabul qilinmaydi!', {
                        reply_markup: {
                            keyboard: [
                                ['Mening ma`lumotlarim']
                            ],
                            resize_keyboard: true
                        }
                    })
                })

            })


        })
    })
});

// Admin va korxona rahbarlari uchun materiallar qisnmi 
// Admin va korxona rahbarlarining ish stoli 
// Bu qismda faqat bugungi arizlarni ko`rish imkoniga ega bo`ladi


bot.onText(/Bugungi arizalar/, async (msg) => {
    const data = new Date();
    const bugun = data.getDate();
    const arizalar = await Ariza.find();
    let bugungikunlar = [];
    if (arizalar.length != 0) {
        for (let i = 0; i < arizalar.length; i++) {
            let kun = arizalar[i].date.getDate();
            if (kun == bugun) {
                bugungikunlar.push(arizalar[i])
            }

        }
    }

    /// admin uchun
    if (msg.chat.id === admin) {
        bot.sendMessage(admin, `Bugun oyning ${bugun}inchi kuni`)
        bugungukunlar(admin, '/a')

    } else if (msg.chat.id === qoshimcha_qism) {
        bot.sendMessage(qoshimcha_qism, `Bugun oyning ${bugun}inchi kuni`)
        bugungukunlar(qoshimcha_qism, '/q')

    } else if (msg.chat.id === dizayner) {
        bot.sendMessage(dizayner, `Bugun oyning ${bugun}inchi kuni`)
        bugungukunlar(dizayner, '/d')

    } else if (msg.chat.id === algoritmchi) {
        bot.sendMessage(algoritmchi, `Bugun oyning ${bugun}inchi kuni`)
        bugungukunlar(algoritmchi, '/f')
    }

    function bugungukunlar(user, fun) {
        if (bugungikunlar.length != 0) {
            for (let i = 0; i < bugungikunlar.length; i++) {
                bot.sendMessage(user, `Ariza raqami № = ${i + 1} ${fun}${bugungikunlar[i]._id}`);
            }
        } else {
            return bot.sendMessage(user, 'Bugun ariza mavjud emas', {
                reply_markup: {
                    keyboard: [
                        ['Ariza bor kunlarni ko`rish']
                    ],
                    resize_keyboard: true
                }
            });
        }
    }

})


// Admin va korxona rahbarlari uchun materiallar qisnmi 
// Admin va korxona rahbarlarining ish stoli 
// Bu qismda faqat bugungi arizlarni ko`rish imkoniga ega bo`ladi

bot.onText(/Arizalar/, async (msg) => {
    const arizalar = await Ariza.find();
    const user = await User.findOne({ userid: msg.chat.id });
    if (user.userid === admin) {
        adminlar(admin, '/a');
    } else if (user.userid === dizayner) {
        adminlar(dizayner, '/d');
    } else if (user.userid === qoshimcha_qism) {
        adminlar(qoshimcha_qism, '/q');
    } else if (user.userid === algoritmchi) {
        adminlar(algoritmchi, '/f');
    }


    function adminlar(user, fun) {
        bot.sendMessage(user, 'Qaysi kundagi ma`lumotlarni izlamoqchisiz?\nNamuna <11.2.2021> "kun, oy, yil"');
        bot.once('text', async (msg) => {
            const text = msg.text.toString();
            const birinchi = text.split('.');
            let bugungikunlar = [];
            for (let i = 0; i < arizalar.length; i++) {
                if (arizalar[i].date.getDate() == birinchi[0] && ((arizalar[i].date.getMonth() + 1) == birinchi[1]) && arizalar[i].date.getFullYear() == birinchi[2]) {
                    bugungikunlar.push(arizalar[i]);
                }
            }
            if (bugungikunlar.length === 0) {
                bot.sendMessage(user, 'Bu kunda arizalar mavjud emas.', {
                    reply_markup: {
                        keyboard: [
                            ['Ariza bor kunlarni ko`rish']
                        ],
                        resize_keyboard: true
                    }
                })
            }
            for (let i = 0; i < bugungikunlar.length; i++) {
                bot.sendMessage(user, `Ariza № = ${i + 1}  ${fun}${bugungikunlar[i]._id}`)
            }

        })
    }
})


// Ariza bor kunlarni ko`rish funksiyasi
// Bu funksiya orqali ariza bor kunlarni ko`rish mumkin.

bot.onText(/Ariza bor kunlarni ko`rish/, async (msg) => {
    const arizalar = await Ariza.find().limit(10);
    let kunlar = [];
    if (arizalar.length === 1) {
        for (let i = 0; i < arizalar.length; i++) {
            kunlar.push(arizalar[i].date)
        }
    } else {
        for (let i = 0; i < arizalar.length; i++) {
            kunlar.push(arizalar[i].date)
        }
        for (let i = 0; i < kunlar.length; i++) {
            for (let j = 0; j < kunlar.length; j++) {
                if (kunlar[i] = kunlar[j]) {
                    kunlar.pop(kunlar[j])
                }
            }
        }
    }
    if (msg.chat.id === admin) {
        arizaborkunlar(arizalar, admin);
    } else if (msg.chat.id === dizayner) {
        arizaborkunlar(arizalar, dizayner);
    } else if (msg.chat.id === qoshimcha_qism) {
        arizaborkunlar(arizalar, qoshimcha_qism);
    } else if (msg.chat.id === algoritmchi) {
        arizaborkunlar(arizalar, algoritmchi);
    }

    function arizaborkunlar(arizalar, user) {
        if (arizalar.length != 0) {

            for (let i = 0; i < kunlar.length; i++) {
                let kun = kunlar[i];
                let dd = kun.getDate();
                let mm = kun.getMonth() + 1;
                let yyyy = kun.getFullYear();
                bot.sendMessage(user, `Kun: ${dd}.${mm}.${yyyy}`, {
                    reply_markup: {
                        keyboard: [
                            ['Bugungi arizalar', 'Arizalar']
                        ],
                        resize_keyboard: true
                    }
                })
            }
        } else {
            bot.sendMessage(user, `Arizalar mavjud emas.`)
        }

    }
})




// Shaxsiy ma`lumotlar 
// Foydalanuvchi o`zi ma`lumotlari ko`rishi un kerak bo`ladigan bo`lim

bot.onText(/Mening ma`lumotlarim/, async (msg) => {
    const user = await User.findOne({ userid: msg.chat.id });
    bot.sendMessage(user.userid, ` Sizning ismingiz: ${user.ismi} \nSizning familiyangiz: ${user.familiyasi} \nSizning passport seriyangiz: ${user.passport} \nSizning telefon raqamingiz: ${user.contact}`, {
        reply_markup: {
            keyboard: [
                ['O`zgartirish', 'Ok'],
                ['Mening ma`lumotlarim']
            ],
            resize_keyboard: true
        }
    })
})


//  O`zgartirish bo`limi ishlanishi
//  Unda ismi passporti familiyasini o`zgartirishiga imkoniga ega bo`ladi
//  uni uchun /ism bosilgandan keyin ishlaydi

bot.onText(/O`zgartirish/, async (msg) => {
    const user = await User.findOne({ userid: msg.chat.id });
    bot.sendMessage(user.userid, 'Foydalanuvchi ma`lumotlarini o`zgartirish \nIsm o`zgartirish /ism \nFamiliya o`zgartirish /fam \nPassport seriyasini o`zgartirish /passport');
    bot.onText(/\/ism/, async (msg) => {
        bot.sendMessage(user.userid, 'Iltimos ismingizni kiriting:')
        bot.once('text', async (msg) => {
            text = msg.text.toString();
            user.ismi = text;
            await user.save();
            bot.sendMessage(user.userid, 'Rahmat! Ma`lumotlaringiz muvaffaqiyatli o`zgartirildi! Qolgan ma`lumotlaringizni o`zgartirish uchun :"O`zgartirish": bo`limini tanlang.')
        })
    })
    bot.onText(/\/fam/, async (msg) => {
        bot.sendMessage(user.userid, 'Iltimos familiyangizni kiriting:')
        bot.once('text', async (msg) => {
            text = msg.text.toString();
            user.familiyasi = text;
            await user.save();
            bot.sendMessage(user.userid, 'Rahmat! Ma`lumotlaringiz muvaffaqiyatli o`zgartirildi! Qolgan ma`lumotlaringizni o`zgartirish uchun :"O`zgartirish": bo`limini tanlang.')
        })
    })
    bot.onText(/\/passport/, async (msg) => {
        bot.sendMessage(user.userid, 'Iltimos Passport seriyangizni kiriting:')
        bot.once('text', async (msg) => {
            text = msg.text.toString();
            user.passport = text;
            await user.save();
            bot.sendMessage(user.userid, 'Rahmat! Ma`lumotlaringiz muvaffaqiyatli o`zgartirildi! Qolgan ma`lumotlaringizni o`zgartirish uchun :"O`zgartirish": bo`limini tanlang.')
        })
    })

})

// Ok qismi berilgan 
// Bu qismdan keyin Sizga arizangizni turlari beriladi


bot.onText(/Ok/, async (msg) => {
    const user = await User.findOne({ userid: msg.chat.id });
    if ((user.contact != null) && (user.ismi != null) && (user.familiyasi != null) && (user.passport != null)) {
        if (user.userid === admin || user.userid === algoritmchi || user.userid === dizayner || user.userid === qoshimcha_qism) {
            bot.sendMessage(user.userid, 'Xush kelibsiz')
        }
        else {
            bot.sendMessage(user.userid, 'Xush kelibsiz!', {
                reply_markup: {
                    keyboard: [
                        ['Ariza berish', 'Arizalarim'],
                        ['Mening ma`lumotlarim']
                    ],
                    resize_keyboard: true
                }
            })
        }
    }
    else {
        bot.sendMessage(user.userid, 'Iltimos ma`lumotlaringizni to`liq kiriting!')
    }
})




// Ariza berish turi
// Ariza berish usulini kiritish kerak bo`ladi


bot.onText(/Ariza berish/, async (msg) => {
    const user = await User.findOne({ userid: msg.chat.id });
    bot.sendMessage(user.userid, 'Ariza turini tanlang:', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Dizayn bo`yicha takliflar',
                    callback_data: 'dizayn'
                }],
                [{
                    text: 'Funksiyalar bo`yicha takliflar',
                    callback_data: 'funksiya'
                }],
                [{
                    text: 'Qo`shimcha takliflar',
                    callback_data: 'qoshimcha'
                }]
            ]
        }
    })

})




// Shaxsiy arizalar ro`yhati


bot.onText(/Arizalarim/, async (msg) => {
    const user = await User.findOne({ userid: msg.chat.id });
    const ariza = await Ariza.find({ userid: msg.chat.id });
    bot.sendMessage(user.userid, `Sizning arizalaringiz: ${ariza.length}`)
    ariza.map(ariza => {
        if (user.userid === msg.chat.id) {
            if (ariza.messageid) {
                bot.sendMessage(user.userid, `Matnli ariza: /m${ariza._id}`)
            }
            if (ariza.audioid) {
                bot.sendMessage(user.userid, `Audio ariza: /m${ariza._id}`)
            }
            if (ariza.documentid) {
                bot.sendMessage(user.userid, `Hujjatli ariza: /m${ariza._id}`)
            }
            if (ariza.photoid) {
                bot.sendMessage(user.userid, `Rasmli ariza: /m${ariza._id}`)
            }
            if (ariza.voiseid) {
                bot.sendMessage(user.userid, `Ovozli ariza: /m${ariza._id}`)
            }
        }
    })
});






// Ariza berish  qismi
bot.on('callback_query', async (query) => {
    const user = await User({ userid: query.message.chat.id })

    switch (query.data) {

        // Birinchi murojaat turi
        // Dizayn bo`yicha takliflar
        // admin va dizaynerga boradigan murojaatlar

        case 'dizayn':
            bot.sendMessage(user.userid, '✅ Arizangizni imkon qadar bitta matnda batafsil yuboring.\n✅ Rasm, audio yoki fayl ilova qilishingiz mumkin.')
            arizayuborish(user, admin, dizayner, '/d')
            bot.answerCallbackQuery(query.id, 'Ok')
            break;



        //   2 - muroajat turi
        //   Funksiya va takliflar bo`yicha muroajat
        // admin va dasturchiga muroajatlar boradi

        case 'funksiya':
            bot.sendMessage(user.userid, '✅ Arizangizni imkon qadar bitta matnda batafsil yuboring.\n✅ Rasm, audio yoki fayl ilova qilishingiz mumkin.')
            arizayuborish(user, admin, algoritmchi, '/f')
            bot.answerCallbackQuery(query.id, 'Ok')
            break;

        //  Uchinchi muroajat turi
        //  Qo`shimcha taklif kiritish uchun manzil.
        //  admin dizayner dasturchi

        case 'qoshimcha':
            bot.sendMessage(user.userid, '✅ Arizangizni imkon qadar bitta matnda batafsil yuboring.\n✅ Rasm, audio yoki fayl ilova qilishingiz mumkin.')
            arizayuborish(user, admin, qoshimcha_qism, '/q')
            bot.answerCallbackQuery(query.id, 'Ok')
            break;




        default:
            break;
    }
})


// Arizalarni o`qish uchun kerak bo`ladigan bo`lim
// Arizalarni o`qish /d belgidan keyin arizaning id si beriladi

// Dizayner uchun o`qish
bot.onText(/\/d(.+)/, async (msg, [source, match]) => {
    fileoqish(dizayner, msg, match)
})

// Algoritmchi uchun o`qish
bot.onText(/\/f(.+)/, async (msg, [source, match]) => {
    fileoqish(algoritmchi, msg, match);
})


// Admin uchun o`qish
bot.onText(/\/a(.+)/, async (msg, [source, match]) => {
    fileoqish(admin, msg, match);
})

// Qo`shimcha qisim uchun o`qish
bot.onText(/\/q(.+)/, async (msg, [source, match]) => {
    fileoqish(qoshimcha_qism, msg, match);
})



// Mening arizalarim 
// Shaxsiy arizalar

bot.onText(/\/m(.+)/, async (msg, [source, match]) => {
    const user = await User.findOne({ userid: msg.chat.id });
    const ariza = await Ariza.findById({ _id: match })
    if (msg.chat.id === user.userid) {
        if (ariza.messageid) {
            bot.sendMessage(user.userid, ariza.messageid)
        }
        if (ariza.audioid) {
            bot.sendAudio(user.userid, ariza.audioid)
        }
        if (ariza.documentid) {
            bot.sendDocument(user.userid, ariza.documentid)
        }
        if (ariza.photoid) {
            bot.sendPhoto(user.userid, ariza.photoid)
        }
        if (ariza.voiseid) {
            bot.sendVoice(user.userid, ariza.voiseid)
        }
    }
})

async function fileoqish(odam, msg, match) {
    const user = await User.findOne({ userid: msg.chat.id });
    const ariza = await Ariza.findById({ _id: match })

    if (msg.chat.id === odam) {
        if (ariza.messageid) {
            const arizachi = await User.findOne({ userid: ariza.userid })
            bot.sendMessage(odam, `Ariza yuboruvchi ${arizachi.familiyasi}  ${arizachi.ismi} \n\nAriza yuboruvchi telefon raqami +${arizachi.contact}`)
            bot.sendMessage(odam, ariza.messageid)
        }
        if (ariza.audioid) {
            const arizachi = await User.findOne({ userid: ariza.userid })
            bot.sendMessage(odam, `Ariza yuboruvchi ${arizachi.familiyasi}  ${arizachi.ismi} \n\nAriza yuboruvchi telefon raqami +${arizachi.contact}`)
            bot.sendAudio(odam, ariza.audioid)
        }
        if (ariza.documentid) {
            const arizachi = await User.findOne({ userid: ariza.userid })
            bot.sendMessage(odam, `Ariza yuboruvchi ${arizachi.familiyasi}  ${arizachi.ismi} \n\nAriza yuboruvchi telefon raqami +${arizachi.contact}`)
            bot.sendDocument(odam, ariza.documentid)
        }
        if (ariza.photoid) {
            const arizachi = await User.findOne({ userid: ariza.userid })
            bot.sendMessage(odam, `Ariza yuboruvchi ${arizachi.familiyasi}  ${arizachi.ismi} \n\nAriza yuboruvchi telefon raqami +${arizachi.contact}`)
            bot.sendPhoto(odam, ariza.photoid, { caption: `${arizachi.familiyasi} ${arizachi.ismi} dan` })
        }
        if (ariza.voiseid) {
            const arizachi = await User.findOne({ userid: ariza.userid })
            bot.sendMessage(odam, `Ariza yuboruvchi ${arizachi.familiyasi}  ${arizachi.ismi} \n\nAriza yuboruvchi telefon raqami +${arizachi.contact}`)
            bot.sendVoice(odam, ariza.voiseid)
        }
    }
};

async function arizayuborish(user, hokim, qoshimcha, fun) {
    bot.once('text', async (msg) => {
        if (msg.chat.id === user.userid) {
            const word = msg.text.toString();
            if (word.length == 26 && word.includes('/m')) {
                return;
            }
            const ariza = await Ariza({ userid: user.userid, messageid: msg.text.toString() });
            await ariza.save();
            bot.sendMessage(ariza.userid, `Sizning arizangiz ko'rib chiqishga yuborildi. /m${ariza._id}`)
            bot.sendMessage(hokim, `Ariza keldi. /a${ariza._id}`)
            bot.sendMessage(qoshimcha, `Ariza keldi. ${fun}${ariza._id}`)
        }
    })

    bot.once('photo', async (msg) => {
        if (msg.chat.id === user.userid) {
            const ariza = Ariza({ userid: msg.chat.id, photoid: msg.photo[1].file_id });
            await ariza.save();
            bot.sendMessage(ariza.userid, `Sizning rasmli arizangiz ko'rib chiqishga yuborildi. /m${ariza._id}`)
            bot.sendMessage(admin, `Ariza keldi. /a${ariza._id}`)
            bot.sendMessage(qoshimcha, `Ariza keldi. ${fun}${ariza._id}`)
        }
    })

    bot.once('audio', async (msg) => {
        if (msg.chat.id === user.userid) {
            const ariza = Ariza({ userid: msg.chat.id, audioid: msg.audio.thumb.file_id });
            await ariza.save();
            bot.sendMessage(ariza.userid, `Sizning audio arizangiz ko'rib chiqishga yuborildi. /m${ariza._id}`)
            bot.sendMessage(admin, `Ariza keldi. /a${ariza._id}`)
            bot.sendMessage(qoshimcha, `Ariza keldi. ${fun}${ariza._id}`)


        }
    })

    bot.once('voice', async (msg) => {
        if (msg.chat.id === user.userid) {
            const ariza = Ariza({ userid: msg.chat.id, voiseid: msg.voice.file_id });
            await ariza.save();
            bot.sendMessage(ariza.userid, `Sizning ovozli arizangiz ko'rib chiqishga yuborildi. /m${ariza._id}`)
            bot.sendMessage(admin, `Ariza keldi. /a${ariza._id}`)
            bot.sendMessage(qoshimcha, `Ariza keldi. ${fun}${ariza._id}`)


        }
    })

    bot.once('document', async (msg) => {
        if (msg.chat.id === user.userid) {
            const ariza = Ariza({ userid: msg.chat.id, documentid: msg.document.file_id });
            await ariza.save();
            bot.sendMessage(ariza.userid, `Sizning hujjatli arizangiz ko'rib chiqishga yuborildi. /m${ariza._id}`)
            bot.sendMessage(admin, `Ariza keldi. /a${ariza._id}`)
            bot.sendMessage(qoshimcha, `Ariza keldi. ${fun}${ariza._id}`)

        }
    })
}