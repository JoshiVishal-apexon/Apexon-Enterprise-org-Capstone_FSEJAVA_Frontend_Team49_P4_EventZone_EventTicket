import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const emailPattern = /^[A-Za-z0-9]+(?:[._%+-]*[A-Za-z0-9]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

export const strictEmailValidator: ValidatorFn = (
  control: AbstractControl<string>
): ValidationErrors | null => {
  const value = control.value.trim();
  return !value || emailPattern.test(value) ? null : { email: true };
};