const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const PessoaRoute = require('./app/routes/pessoa')
const FamiliarRoute = require('./app/routes/familiar')
const ResidenteRoute = require('./app/routes/residente')
const EnderecoRoute = require('./app/routes/endereco')
const TelefoneRoute = require('./app/routes/telefone')
const BeneficioRoute = require('./app/routes/beneficiogit')


/*
* CONFIG bodyParser
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

app.get('/', function(req, res){
    res.send("API Funcionando")
})

//API Pessoa
app.use('/', PessoaRoute)

//API FAMILIAR
app.use('/', FamiliarRoute)

//API Residente
app.use('/', ResidenteRoute)

//API ENDEREÇO
app.use('/', EnderecoRoute)

//API TELEFONE
app.use('/', TelefoneRoute)

//API BENEFICIO
app.use('/', BeneficioRoute)

app.listen(3000, function(){
    console.log("API rodando na porta 3000")
})

module.exports = app