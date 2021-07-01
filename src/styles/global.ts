import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  *{
    margin: 0;
    padding: 0;
    outline:0;
    box-sizing:border-box;
    font-family: 'Open Sans', sans-serif; 
  }
  body {
    margin: 0;
  }
  :root {
    --action-orange: #EF5233;
    --neon-green: #24FF00;
  }
`;
