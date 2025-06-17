import React from 'react';
import './css/Button.css';

export default function Button({ text, bgColor, onClick}) {
  const style = {
    backgroundColor: bgColor,
  };

  return (
    <button className="button" style={style} onClick={onClick} type="button">
      {text}
    </button>
  );
}
