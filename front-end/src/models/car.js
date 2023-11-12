import { z } from 'zod';

const today = new Date();

const Car = z.object({
  brand:
  z.string()
  .min(1, { message: 'O comprimento mínimo é 1' })
  .max(25, { message: 'O comprimento máximo é 25' }),

  model: 
  z.string()
  .min(1, { message: 'O comprimento mínimo é 1' })
  .max(25, { message: 'O comprimento máximo é 25' }),
  
  color: 
  z.string()
  .min(4, { message: 'O comprimento mínimo é 4' })
  .max(20, { message: 'O comprimento máximo é 20' }),

  year_manufacture: 
  z.number()
  .int()
  .min(1940, { message: 'O ano mínimo é 1940' })
  .max(2023, { message: 'O ano máximo é 2023' }),

  imported: 
  z.boolean(),

  plates: 
  z.string()
    .refine((value) => /^[A-Z0-9-]{8}$/.test(value), {
      message: 'As placas devem conter apenas letras maiúsculas e números (8 caracteres).'
    }),

  selling_date:
    z.date()
      .nullable()
      .refine((date) => {
        if (date === null) return true; // Permite valor nulo
        return date <= today; // A data não pode ser posterior à data de hoje
      }, { message: 'A data de venda não pode ser posterior à data de hoje.' }),

      selling_price:
      z.number()
        .nullable()
        .refine((value) => {
          // Se a data de venda for nula, o preço também deve ser nulo
          if (value === null) return true;
          
          // Agora, garantimos que `parent` não é `undefined` antes de acessar `parent.selling_date`
          return value >= 2000 && (value !== null && value >= 2000);
        }, {
          message: 'O preço de venda deve ser nulo ou pelo menos R$2.000.'
        }),


  customer_id:
  z.number()
  .int()
  .refine((value) => value >= 0 || value === null),
});

export default Car