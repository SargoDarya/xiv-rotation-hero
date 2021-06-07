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
export function createRadio(radioGroup, value, ...classNames) {
    const input = createInput('radio', ...classNames);
    input.type = 'radio';
    input.name = radioGroup;
    input.value = value;
    return input;
}
export function createSelect(options, ...classNames) {
    const select = createView('select', ...classNames);
    options.forEach(([label, value]) => {
        const option = document.createElement('option');
        option.label = label;
        option.value = value;
        select.appendChild(option);
    });
    return select;
}
