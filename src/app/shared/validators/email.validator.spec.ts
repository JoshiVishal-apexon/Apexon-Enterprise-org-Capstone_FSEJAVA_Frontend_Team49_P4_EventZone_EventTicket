import { FormControl } from '@angular/forms';
import { strictEmailValidator } from './email.validator';

describe('strictEmailValidator', () => {
  it('rejects a numeric domain suffix', () => {
    const control = new FormControl('test@g.12');

    expect(strictEmailValidator(control)).toEqual({ email: true });
  });

  it('rejects a local part without an alphanumeric character', () => {
    const control = new FormControl('-@ab.cp');

    expect(strictEmailValidator(control)).toEqual({ email: true });
  });

  it('accepts an email with a letter-based domain suffix', () => {
    const control = new FormControl('test@example.com');

    expect(strictEmailValidator(control)).toBeNull();
  });
});