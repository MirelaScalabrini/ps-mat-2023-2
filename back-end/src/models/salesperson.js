import { z } from 'zod'
import { cpf } from 'cpf-cnpj-validator'

// O vendedor deve ser maior de 18 anos
const maxBirthDate = new Date()   // Hoje
maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18)  // Data há 18 anos atrás

// O vendedor pode ter nascido, no máximo, há 120 anos
const minBirthDate = new Date()
minBirthDate.setFullYear(maxBirthDate.getFullYear() - 120)

const Salesperson = z.object ({
    user_id: 
    z.integer(),
    
    birth_date: 
    // coerce força a conversão para o tipo Date, se o dado recebido for string
    z.coerce.date()
    .min(minBirthDate, { message: 'Data de nascimento está muito no passado'})
    .max(maxBirthDate, { message: 'O vendedor deve ser maior de 18 anos' })
    .nullable(),

    ident_document: 
    z.string()
    .trim()
    .length(14, { message: 'O CPF está incompleto'})
    .refine(val => cpf.isValid(val), { message: 'CPF inválido' }),

    salary:
    z.number()
    .min(1500, { message: 'O salário deve ser no mínimo R$ 1.500,00' })
    .max(20000, { message: 'O salário deve ser no máximo R$ 20.000,00' }),

    phone:
    z.string()
    .transform(v => v.replace('_', '')) // Retira os sublinhados
    // Depois de um transform(), não podemos usar length(). Por isso, temos que
    // usar refine() passando uma função personalizada para validar o tamanho do campo
    .refine(v => v.length == 15, { message: 'O número do telefone/celular está incompleto' }),

    date_of_hire:
    z.date()
    .min(new Date('2020-01-01'), { message: 'A data deve ser após 01/01/2020' })
    .max(new Date(), { message: 'A data não pode ser depois de hoje' }),
})