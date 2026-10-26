import {
  isEmail,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEmailOrEgyptianPhone', async: false })
export class IsEmailOrEgyptianPhone implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return (
      typeof value === 'string' &&
      (isEmail(value) || /^01[0125][0-9]{8}$/.test(value))
    );
  }
}
