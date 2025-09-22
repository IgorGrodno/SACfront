import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ui-button',
  template: `
    <button
      class="ui-button"
      [attr.aria-label]="ariaLabel"
      [disabled]="disabled"
      (click)="click.emit($event)"
      type="button"
    >
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Output() click = new EventEmitter<Event>();
}
