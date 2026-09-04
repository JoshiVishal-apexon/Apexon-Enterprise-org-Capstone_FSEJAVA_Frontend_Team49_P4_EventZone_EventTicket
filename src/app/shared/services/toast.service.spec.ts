import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should add and dismiss a toast', () => {
    service.show('Hello', 'success', 1000);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Hello');
    expect(service.toasts()[0].type).toBe('success');

    jasmine.clock().tick(1001);
    expect(service.toasts().length).toBe(0);
  });

  it('should add convenience toast helpers', () => {
    service.success('Saved');
    service.error('Failed');
    service.info('Info');

    expect(service.toasts().map((t) => t.type)).toEqual(['success', 'error', 'info']);
  });

  it('should dismiss a specific toast', () => {
    service.show('One');
    service.show('Two');

    service.dismiss(service.toasts()[0].id);

    expect(service.toasts().map((t) => t.message)).toEqual(['Two']);
  });

  it('should keep a toast visible when duration is zero', () => {
    service.show('Persistent', 'info', 0);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Persistent');
    jasmine.clock().tick(1000);
    expect(service.toasts().length).toBe(1);
  });
});
