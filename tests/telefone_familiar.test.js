/**
 * author: hppod
 * create: 21/02/2019 14h39
 * file: telefone_familiar.test.js
 */

const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
chai.use(chaiHttp)

const app = require('./../app')
const { TelefoneFamiliarModel } = require('./../app/models')
const { TelefoneModel } = require('./../app/models')
const { FamiliarModel } = require('./../app/models')

const MOCK_TELEFONE_FAMILIAR_DEFAULT = {
    FAMILIAR_CODIGO: null,
    TELEFONE_CODIGO: null
}

const MOCK_TELEFONE_FAMILIAR_CADASTRAR = {
    FAMILIAR_CODIGO: 1,
    TELEFONE_CODIGO: 2
}

const MOCK_TELEFONE_FAMILIAR_ERROR = {
    FAMILIAR_CODIGO: 1
}

const MOCK_TELEFONE_FAMILIAR_ERROR_EQUAL_POST = {
    FAMILIAR_CODIGO: 1,
    TELEFONE_CODIGO: 1
}

const MOCK_TELEFONE_FAMILIAR_ATUALIZAR = {
    FAMILIAR_CODIGO: 2,
    TELEFONE_CODIGO: 3
}

const MOCK_TELEFONE_DEFAULT = {
    DDD: '16',
    NUMERO: '32630101'
}

const MOCK_FAMILIAR_DEFAULT = {
    NOME: 'ANDRÉ',
    SOBRENOME: 'RIBEIRO',
    PARENTESCO: 'FILHO'
}

let MOCK_TELEFONE_FAMILIAR_FAMILIAR_CODIGO

//TESTS

describe('Test Driven Development SALV-API Telefone Familiar', function () {
    this.beforeAll(async () => {
        const telefone = await TelefoneModel.create(MOCK_TELEFONE_DEFAULT)
        const familiar = await FamiliarModel.create(MOCK_FAMILIAR_DEFAULT)

        console.log('ADICIONANDO VALORES AO MOCK')
        MOCK_TELEFONE_FAMILIAR_DEFAULT.FAMILIAR_CODIGO = familiar.CODIGO
        MOCK_TELEFONE_FAMILIAR_DEFAULT.TELEFONE_CODIGO = telefone.CODIGO

        const result = await TelefoneFamiliarModel.create(MOCK_TELEFONE_FAMILIAR_DEFAULT)

        MOCK_TELEFONE_FAMILIAR_FAMILIAR_CODIGO = result.FAMILIAR_CODIGO

        console.log('FAMILIAR ' + MOCK_TELEFONE_FAMILIAR_FAMILIAR_CODIGO)
    })

    
    describe('/GET/ID: ', () => {
        it('Deve retornar o telefone de um familiar dado o ID dele', (done) => {
            chai.request(app)
                .get(`/telefone_familiar/${MOCK_TELEFONE_FAMILIAR_FAMILIAR_CODIGO}`)
                .end((error, res) => {
                    const result = res.body
                    expect(res.statusCode).to.eql(200)
                    expect(result).to.eql(MOCK_TELEFONE_FAMILIAR_DEFAULT)
                    done()
                })
        })
    })


})