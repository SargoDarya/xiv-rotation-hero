export function createView(type: string, ...classNames: string[]): HTMLElement {
  const view = document.createElement(type);
  view.classList.add(...classNames);
  return view;
}

export function createInput(type: string, ...classNames: string[]): HTMLInputElement {
  const input = <HTMLInputElement>createView('input', ...classNames);
  input.type = type;
  return input;
}

export function createCheckbox(...classNames: string[]): HTMLInputElement {
  return createInput('checkbox', ...classNames);
}

export function createRadio(radioGroup: string, value: string, ...classNames: string[]): HTMLInputElement {
  const input = <HTMLInputElement>createInput('radio', ...classNames);
  input.type = 'radio';
  input.name = radioGroup;
  input.value = value;
  return input;
}

export function createSelect(options: [ string, string ][], selectedOption: string, ...classNames: string[]): HTMLSelectElement {
  const select = <HTMLSelectElement>createView('select', ...classNames);
  options.forEach(([ label, value ]) => {
    const option = document.createElement('option');
    option.label = label;
    option.value = value;
    option.selected = value === selectedOption;
    select.appendChild(option);
  });
  return select;
}

export function wrapForStyle(elementToWrap: HTMLElement): HTMLElement {
  const styleWrapper = document.createElement('label');
  styleWrapper.classList.add('ui-style');

  const styleElement = document.createElement('span');
  styleElement.classList.add('ui-style-element');

  styleWrapper.appendChild(elementToWrap);
  styleWrapper.appendChild(styleElement);

  return styleWrapper;
}
