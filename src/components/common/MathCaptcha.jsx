import { useState, useEffect, useCallback, useRef } from 'react';
import './MathCaptcha.css';

const defaultLabels = {
  incorrect: 'Incorrect answer',
  expired: 'Captcha expired. Please refresh and try again.',
  refreshAria: 'Generate new captcha',
  inputAria: 'Enter captcha result',
  expiresIn: 'Expires in',
  secondsSuffix: 's',
  answerPlaceholder: '?',
};

export default function MathCaptcha({
  onValidChange,
  labels = defaultLabels,
  expiresInSeconds = 90,
}) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds);
  const mergedLabels = { ...defaultLabels, ...labels };

  const onValidChangeRef = useRef(onValidChange);
  useEffect(() => {
    onValidChangeRef.current = onValidChange;
  }, [onValidChange]);

  const generateCaptcha = useCallback(() => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '×'];
    const newOperator = operators[Math.floor(Math.random() * operators.length)];

    let actualNum1 = newNum1;
    let actualNum2 = newNum2;

    if (newOperator === '-' && newNum1 < newNum2) {
      actualNum1 = newNum2;
      actualNum2 = newNum1;
    }

    setNum1(actualNum1);
    setNum2(actualNum2);
    setOperator(newOperator);
    setUserAnswer('');
    setIsValid(false);
    setShowError(false);
    setIsExpired(false);
    const nextExpiresAt = Date.now() + expiresInSeconds * 1000;
    setExpiresAt(nextExpiresAt);
    setSecondsLeft(expiresInSeconds);

   
    if (onValidChangeRef.current) onValidChangeRef.current(false);


  }, [expiresInSeconds]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (expiresAt && secondsLeft === 0 && !isExpired) {
      setIsExpired(true);
      setIsValid(false);
      if (onValidChangeRef.current) onValidChangeRef.current(false);
      if (userAnswer !== '') setShowError(true);
    }
  }, [expiresAt, isExpired, secondsLeft, userAnswer]);

  const getCorrectAnswer = () => {
    switch (operator) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '×': return num1 * num2;
      default:  return num1 + num2;
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9-]/g, '');
    setUserAnswer(value);
    setShowError(false);

    if (isExpired) {
      setIsValid(false);
      if (onValidChangeRef.current) onValidChangeRef.current(false);
      return;
    }

    if (value !== '') {
      const correct = parseInt(value, 10) === getCorrectAnswer();
      setIsValid(correct);
      if (onValidChangeRef.current) onValidChangeRef.current(correct);
    } else {
      setIsValid(false);
      if (onValidChangeRef.current) onValidChangeRef.current(false);
    }
  };

  const handleBlur = () => {
    if (userAnswer !== '' && (!isValid || isExpired)) {
      setShowError(true);
    }
  };

  return (
    <div className="math-captcha">
      <div className="math-captcha__question">
        <span className="math-captcha__numbers">
          {num1} {operator} {num2} = ?
        </span>
        <button
          type="button"
          className="math-captcha__refresh"
          onClick={generateCaptcha}
          aria-label={mergedLabels.refreshAria}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
        <span className={`math-captcha__timer ${isExpired ? 'math-captcha__timer--expired' : ''}`}>
          <span className="sr-only" aria-live="polite">
            {isExpired ? mergedLabels.expired : `${mergedLabels.expiresIn} ${secondsLeft}`}
          </span>
          {isExpired
            ? mergedLabels.expired
            : `${mergedLabels.expiresIn} ${secondsLeft}${mergedLabels.secondsSuffix}`}
        </span>
      </div>
      <div className="math-captcha__input-wrapper">
        <input
          type="text"
          inputMode="numeric"
          value={userAnswer}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={mergedLabels.answerPlaceholder}
          className={`math-captcha__input
            ${showError ? 'math-captcha__input--error' : ''}
            ${isValid  ? 'math-captcha__input--valid' : ''}`}
          aria-label={mergedLabels.inputAria}
        />
        {isValid && (
          <span className="math-captcha__check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        )}
      </div>
      {showError && (
        <span className="math-captcha__error">
          {isExpired ? mergedLabels.expired : mergedLabels.incorrect}
        </span>
      )}
    </div>
  );
}