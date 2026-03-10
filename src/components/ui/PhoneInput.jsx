import { useState } from 'react';

export const PhoneInput = ({ value, onChange, ...props }) => {
  const [displayValue, setDisplayValue] = useState(value || '');

  const formatPhone = (input) => {
    // Remove tudo exceto números e +
    const numbers = input.replace(/[^\d+]/g, '');
    
    // Se começar com +239, formata com espaços
    if (numbers.startsWith('+239')) {
      const rest = numbers.substring(4);
      if (rest.length <= 3) {
        return `+239 ${rest}`;
      } else if (rest.length <= 5) {
        return `+239 ${rest.substring(0, 3)} ${rest.substring(3)}`;
      } else {
        return `+239 ${rest.substring(0, 3)} ${rest.substring(3, 5)} ${rest.substring(5, 7)}`;
      }
    }
    
    // Se for apenas números e começar com 9
    if (/^9\d*$/.test(numbers) && numbers.length <= 7) {
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 5) {
        return `${numbers.substring(0, 3)} ${numbers.substring(3)}`;
      } else {
        return `${numbers.substring(0, 3)} ${numbers.substring(3, 5)} ${numbers.substring(5, 7)}`;
      }
    }
    
    return input;
  };

  const handleChange = (e) => {
    const input = e.target.value;
    const formatted = formatPhone(input);
    
    setDisplayValue(formatted);
    
    // CORREÇÃO: Criar um evento sintético para o react-hook-form
    const cleanValue = formatted.replace(/\s/g, '');
    
    // Criar um objeto de evento falso
    const fakeEvent = {
      target: {
        name: props.name,  // Importante para o react-hook-form
        value: cleanValue
      }
    };
    
    onChange(fakeEvent);  // Passa o evento em vez da string
  };

  const handleBlur = () => {
    // Garante que o número está completo e bem formatado
    if (displayValue && !displayValue.startsWith('+239')) {
      const numbers = displayValue.replace(/\s/g, '');
      if (numbers.length === 7 && numbers.startsWith('9')) {
        const formatted = `+239 ${numbers.substring(0, 3)} ${numbers.substring(3, 5)} ${numbers.substring(5)}`;
        setDisplayValue(formatted);
        
        // CORREÇÃO: Também no blur
        const fakeEvent = {
          target: {
            name: props.name,
            value: `+239${numbers}`
          }
        };
        onChange(fakeEvent);
      }
    }
  };

  return (
    <input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="+239 999 87 54 ou 9998754"
      className="input"
      {...props}
    />
  );
};