import * as yup from 'yup';

export const GasDatumSchema  = yup.object({
  carMileage: yup.number().required(),
  gasAmount: yup.number().required(),
  gasCost: yup.number().required(),
  timeStamp: yup.string().required().datetime(),
});

export const GasDataSchema = yup.array(GasDatumSchema).required();
