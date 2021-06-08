export function createView(type, ...classNames) {
    const view = document.createElement(type);
    view.classList.add(...classNames);
    return view;
}
export function createInput(type, ...classNames) {
    const input = createView('input', ...classNames);
    input.type = type;
    return input;
}
export function createCheckbox(...classNames) {
    return createInput('checkbox', ...classNames);
}
export function createRadio(radioGroup, value, ...classNames) {
    const input = createInput('radio', ...classNames);
    input.type = 'radio';
    input.name = radioGroup;
    input.value = value;
    return input;
}
export function createSelect(options, selectedOption, ...classNames) {
    const select = createView('select', ...classNames);
    options.forEach(([label, value]) => {
        const option = document.createElement('option');
        option.label = label;
        option.value = value;
        option.selected = value === selectedOption;
        select.appendChild(option);
    });
    return select;
}
export function wrapForStyle(elementToWrap) {
    const styleWrapper = document.createElement('label');
    styleWrapper.classList.add('ui-style');
    const styleElement = document.createElement('span');
    styleElement.classList.add('ui-style-element');
    styleWrapper.appendChild(elementToWrap);
    styleWrapper.appendChild(styleElement);
    return styleWrapper;
}
