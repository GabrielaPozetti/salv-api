//Requires
const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const hbs = require('handlebars')
const path = require('path')
const sequelize = require('./../../database/sequelize_remote')
const helpers = require('./helpers')
const {
    PessoaModel,
    FuncionarioModel,
    DependenteModel,
    TelefoneModel,
    EnderecoModel,
    TelefonePessoaModel,
    EnderecoPessoaModel,
    AcompanhamentosModel,
    AcompanhamentoResidenteModel,
    AcompanhamentoFuncionarioModel,
    ResidenteModel,
    ConvenioModel,
    EnderecoConvenioModel,
    TelefoneConvenioModel,
    ResidenteConvenioModel,
    BeneficioModel,
    ResidenteFamiliarModel,
    FamiliarModel,
    EnderecoFamiliarModel,
    TelefoneFamiliarModel
} = require('./../../app/models')

//Variable that receives the objects from database
var data_acompanhamento;
var data_convenio;
var data_funcionario;
var data_residente;

//Function that compiles the template and data
const compile = async function (templateName, data) {
    const filePath = path.join(process.cwd(), './reports/templates', `${templateName}.hbs`)
    const html = await fs.readFile(filePath, 'utf-8')
    return hbs.compile(html)(data)
}

//Function responsible for generating report
const reportAcompanhamento = async (codigoAcompanhamento) => {
    try {
        //Database query
        const acompanhamento = await AcompanhamentosModel.findOne({
            attributes: [
                [sequelize.fn('date_format', sequelize.col('DATA_ACOMPANHAMENTO'), '%d/%m/%Y'), 'DATA_ACOMPANHAMENTO'],
                'ATIVIDADE'
            ],
            where: {
                CODIGO: codigoAcompanhamento
            }
        })
        //Database query
        const residentes = await ResidenteModel.findAll({
            attributes: [
                'APELIDO'
            ],
            include: [
                {
                    model: PessoaModel, as: 'PESSOA',
                    attributes: [
                        'NOME'
                    ]
                },
                {
                    model: AcompanhamentoResidenteModel, as: 'ACOMPANHAMENTO_RESIDENTE',
                    where: {
                        ACOMPANHAMENTO_CODIGO: codigoAcompanhamento
                    }
                }
            ]
        })
        //Database query
        const funcionarios = await FuncionarioModel.findAll({
            include: [
                {
                    model: PessoaModel, as: 'PESSOA',
                    attributes: [
                        'NOME',
                        'SOBRENOME'
                    ]
                },
                {
                    model: AcompanhamentoFuncionarioModel, as: 'ACOMPANHAMENTO_FUNCIONARIO',
                    where: {
                        ACOMPANHAMENTO_CODIGO: codigoAcompanhamento
                    }
                }
            ]
        })

        //Set database result to variable
        data_acompanhamento = {
            "acompanhamento": acompanhamento,
            "residentes": residentes,
            "funcionarios": funcionarios
        }

        //Launch puppeteer, create new page, call compile function
        const browser = await puppeteer.launch({
            'args': [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        })
        const page = await browser.newPage()
        const content = await compile('acompanhamento', data_acompanhamento)

        //Set page content, emulate screen, config page
        await page.setContent(content)
        await page.emulateMedia('print')
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '10px',
                right: '10px'
            }
        })

        //Log done, close puppeteer, return result
        console.log('done')
        await browser.close()
        return pdf

    } catch (e) {
        console.log(e)
    }
};

//Function responsible for generating report
const reportConvenio = async (codigoConvenio) => {
    try {
        //Database query
        const convenio = await ConvenioModel.findOne({
            where: {
                CODIGO: codigoConvenio
            }
        })
        //Database query
        const enderecos = await EnderecoConvenioModel.findAll({
            where: {
                CONVENIO_CODIGO: codigoConvenio
            },
            include: {
                model: EnderecoModel, as: 'ENDERECO'
            }
        })
        //Database query
        const telefones = await TelefoneConvenioModel.findAll({
            where: {
                CONVENIO_CODIGO: codigoConvenio
            },
            include: {
                model: TelefoneModel, as: 'TELEFONE'
            }
        })

        //Set database result to variable
        data_convenio = {
            "convenio": convenio,
            "enderecos": enderecos,
            "telefones": telefones
        }

        //Launch puppeteer, create new page, call compile function
        const browser = await puppeteer.launch({
            'args': [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        })
        const page = await browser.newPage()
        const content = await compile('convenio', data_convenio)

        //Set page content, emulate screen, config page
        await page.setContent(content)
        await page.emulateMedia('print')
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '10px',
                right: '10px'
            }
        })

        //Log done, close puppeteer, return result
        console.log('done')
        await browser.close()
        return pdf

    } catch (e) {
        console.log(e)
    }
};

//Function resposible for generating report
const reportFuncionario = async (codigoPessoa, codigoFuncionario) => {
    try {
        //Database query
        const pessoa = await PessoaModel.findOne({
            attributes: [
                'NOME',
                'SOBRENOME',
                'RG',
                'CPF',
                'SEXO',
                'ESTADO_CIVIL',
                [sequelize.fn('date_format', sequelize.col('DATA_NASCIMENTO'), '%d/%m/%Y'), 'DATA_NASCIMENTO'],
                'RELIGIAO',
                'ESCOLARIDADE'
            ],
            where: {
                CODIGO: codigoPessoa
            }
        })
        //Database query
        const enderecos = await EnderecoPessoaModel.findAll({
            where: {
                PESSOA_CODIGO: codigoPessoa
            },
            include: {
                model: EnderecoModel, as: 'ENDERECO'
            }
        })
        //Database query
        const telefones = await TelefonePessoaModel.findAll({
            where: {
                PESSOA_CODIGO: codigoPessoa
            },
            include: {
                model: TelefoneModel, as: 'TELEFONE'
            }
        })
        //Database query
        const funcionario = await FuncionarioModel.findOne({
            attributes: [
                'CARGO',
                [sequelize.fn('date_format', sequelize.col('DATA_ADMISSAO'), '%d/%m/%Y'), 'DATA_ADMISSAO'],
                [sequelize.fn('date_format', sequelize.col('DATA_DEMISSAO'), '%d/%m/%Y'), 'DATA_DEMISSAO']
            ],
            where: {
                CODIGO_FUNCIONARIO: codigoFuncionario
            }
        })
        //Database query
        const dependentes = await DependenteModel.findAll({
            attributes: [
                'NOME',
                'SOBRENOME',
                [sequelize.fn('date_format', sequelize.col('DATA_NASCIMENTO'), '%d/%m/%Y'), 'DATA_NASCIMENTO'],
                'RG',
                'CPF',
                'NUMERO_CERTIDAO_NASCIMENTO',
                'FOLHA_CERTIDAO_NASCIMENTO',
                'LIVRO_CERTIDAO_NASCIMENTO',
                'CIDADE_CERTIDAO_NASCIMENTO',
                'ESTADO_CERTIDAO_NASCIMENTO',
            ],
            where: {
                CODIGO_FUNCIONARIO: codigoFuncionario
            }
        })

        //Set database result to variable
        data_funcionario = {
            "pessoa": pessoa,
            "enderecos": enderecos,
            "telefones": telefones,
            "funcionario": funcionario,
            "dependentes": dependentes
        }

        //Launch puppeteer, create new page, call compile function
        const browser = await puppeteer.launch({
            'args': [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        })
        const page = await browser.newPage()
        const content = await compile('funcionario', data_funcionario)

        //Set page content, emulate screen, config page
        await page.setContent(content)
        await page.emulateMedia('print')
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '10px',
                right: '10px'
            }
        })

        //Log done, close puppeteer, return result
        console.log('done')
        browser.close()
        return pdf

    } catch (e) {
        console.log(e)
    }
};

//Function resposible for generating report
const reportResidente = async (codigoPessoa, codigoResidente) => {
    try {
        //Database query
        const pessoa = await PessoaModel.findOne({
            attributes: [
                'NOME',
                'SOBRENOME',
                'RG',
                'CPF',
                'SEXO',
                'ESTADO_CIVIL',
                [sequelize.fn('date_format', sequelize.col('DATA_NASCIMENTO'), '%d/%m/%Y'), 'DATA_NASCIMENTO'],
                'RELIGIAO',
                'ESCOLARIDADE'
            ],
            where: {
                CODIGO: codigoPessoa
            }
        })
        //Database query
        const residente = await ResidenteModel.findOne({
            attributes: [
                'APELIDO',
                'PROFISSAO',
                'TITULO_ELEITOR',
                'ZONA_ELEITORAL',
                'SECAO_ELEITORAL',
                'NUMERO_CERTIDAO_NASCIMENTO',
                'FOLHA_CERTIDAO_NASCIMENTO',
                'LIVRO_CERTIDAO_NASCIMENTO',
                'CIDADE_CERTIDAO_NASCIMENTO',
                'ESTADO_CERTIDAO_NASCIMENTO',
                'CARTAO_SAMS',
                'CARTAO_SUS',
                'NUMERO_INSS',
                'BANCO_INSS',
                'AGENCIA_INSS',
                'CONTA_INSS',
                'VALOR_INSS',
                'SITUACAO_INSS',
                [sequelize.fn('date_format', sequelize.col('PROVA_VIDA_INSS'), '%d/%m/%Y'), 'PROVA_VIDA_INSS'],
                [sequelize.fn('date_format', sequelize.col('DATA_ACOLHIMENTO'), '%d/%m/%Y'), 'DATA_ACOLHIMENTO'],
                [sequelize.fn('date_format', sequelize.col('DATA_DESACOLHIMENTO'), '%d/%m/%Y'), 'DATA_DESACOLHIMENTO'],
                'MOTIVO_DESACOLHIMENTO'
            ],
            where: {
                CODIGO_RESIDENTE: codigoResidente
            }
        })
        //Database query
        const convenios = await ResidenteConvenioModel.findAll({
            where: {
                RESIDENTE_CODIGO: codigoResidente,
                STATUS: 1
            },
            include: {
                model: ConvenioModel, as: 'CONVENIO'
            }
        })
        //Database query
        const beneficios = await BeneficioModel.findAll({
            attributes: [
                'NOME_BENEFICIO',
                'BANCO_BENEFICIO',
                'AGENCIA_BENEFICIO',
                'CONTA_BENEFICIO',
                'VALOR_BENEFICIO',
                [sequelize.fn('date_format', sequelize.col('PROVA_VIDA_BENEFICIO'), '%d/%m/%Y'), 'PROVA_VIDA_BENEFICIO']
            ],
            where: {
                CODIGO_RESIDENTE: codigoResidente
            }
        })
        //Database query
        const familiares = await ResidenteFamiliarModel.findAll({
            where: {
                RESIDENTE_CODIGO: codigoResidente
            },
            include: [{
                model: FamiliarModel, as: 'FAMILIAR',
                include: [
                    {
                        model: TelefoneFamiliarModel, as: 'TELEFONE_FAMILIAR',
                        include: {
                            model: TelefoneModel, as: 'TELEFONE'
                        }
                    },
                    {
                        model: EnderecoFamiliarModel, as: 'ENDERECO_FAMILIAR',
                        include: {
                            model: EnderecoModel, as: 'ENDERECO'
                        }
                    }
                ]
            }]
        })

        //Set database result to variable
        data_residente = {
            "pessoa": pessoa,
            "residente": residente,
            "convenios": convenios,
            "beneficios": beneficios,
            "familiares": familiares
        }

        //Launch puppeteer, create new page, call compile function
        const browser = await puppeteer.launch({
            'args': [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        })
        const page = await browser.newPage()
        const content = await compile('residente', data_residente)

        //Set page content, emulate screen, config page
        await page.setContent(content)
        await page.emulateMedia('print')
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '10px',
                right: '10px'
            }
        })

        //Log done, close puppeteer, return result
        console.log('done')
        await browser.close()
        return pdf

    } catch (e) {
        console.log(e)
    }
}

module.exports = { reportAcompanhamento, reportConvenio, reportFuncionario, reportResidente }