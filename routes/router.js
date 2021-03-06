const Message = require('../database/Message')
const { Sequelize } = require('../database/db')
const Op = Sequelize.Op
const express = require('express')
const { response } = require('express')
const router = express.Router()

//Redireciona para a rota /home quando não for passado nenhuma
router.get('/', (req, res) => {
    res.redirect('/home')
})

//Rota home
router.get('/home', (req, res) => {
    res.render('pages/home')
})

//Retorna todas as mensagens do banco
router.get('/messages/all', (req, res) => {
    Message.findAll({
        attributes: ['id_message', 'title_message', 'content_message']
    }).then((messages) => {
        res.render('pages/allmessages', {messages: messages})
    }).catch((err) => {
        res.send(`Error on catch all messages from database: ${err}`)
    })
})

//Retorna mensagens com base em pesquisa
//usando operador LIKE
router.get('/messages/search', (req, res) => {
    if(req.query.search){
        Message.findAll({
            where: {
                title_message: {
                    [Op.like]: `%${req.query.search}%`
                }
            }
        }).then((messages) => {
            res.render('pages/searchresult', {messages: messages})
        }).catch((err) => {
            res.send(`Error on search: ${err}`);
        })
    } else {
        res.redirect('/messages/all')
    }
})

//Rota para começar a criar uma nova mensagem
router.get('/message/create', (req, res) => {
    res.render('pages/crtmessage')
})

//Rota para salvar uma nova mensagem
router.post('/message/add', (req, res) => {
    if(req.body.title && req.body.content){
        Message.create({
            title_message: req.body.title,
            content_message: req.body.content
        }).then(() => {
            //Redireciona para a rota Home quando salvo com sucesso
            res.redirect("/home?s=" + encodeURIComponent("message-created"))
        }).catch((err) => {
            res.send(`Error on create a new message: ${err}`)
        })
    } else {
        res.send("Campos vazios são inválidos")
    }
})

//Rota GET para deletar uma mensagem
router.get('/message/delete/:id', (req, res) => {
    Message.destroy({
        where: {
            id_message: req.params.id
        }
    }).then(() => {
        res.redirect("/home?s=" + encodeURIComponent("message-deleted"))
    }).catch((err) => {
        res.send(`Erro ao deletar a mensagem: ${err}`)
    })
})

//Rota para visualização de mensagem individualmente
router.get('/messages/view/:id', (req, res) => {
    Message.findAll({
        where: {
            id_message: req.params.id
        }
    }).then((message) => {
        if(message.length === 1){
            res.render('pages/viewmessage', {message: message})
        } else {
            res.render("pages/404")
        }
    }).catch((err) => {
        res.send(`Não foi possível abrir esta mensagem: ${err}`)
    })
})

//Rota para atualização de mensagem
router.get('/messages/update/:id', (req, res) => {
    Message.findAll({
        where: {
            id_message: req.params.id
        }
    }).then((messages) => {
        if(messages.lenth === 1) {
            res.render('pages/uptmessage', {messages: messages})
        } else {
            res.render("pages/404")
        }
    }).catch((err) => {
        res.send(`Erro ao abrir a mensagem para atualizar: ${err}`)
    })
})

router.post('/messages/update/:id', (req, res) => {
    if(req.body.newtitle && req.body.newcontent){
        Message.update({
            title_message: req.body.newtitle,
            content_message: req.body.newcontent
        },
        {
            where: {
                id_message: req.params.id
            }
        }).then(() => {
            res.redirect('/home')
        }).catch((err) => {
            res.send(`Não foi possível atualizar a mensagem:  ${err}`)
        })
    } else {
        res.send("Campos com parâmetros zerados, inválido")
    }
})

module.exports = router