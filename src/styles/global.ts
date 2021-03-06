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
    --dark-purple: #45354C;
    --cancel-gray: #6a6969;
    --error-red: #ff6166;
  }
  .MuiListItem-root.Mui-selected {
    background-color: var(--action-orange)!important;
    border-radius: 6px;
  }
  .MuiListItem-root {
    border-radius: 6px;
  }
  .CheckCircleIcon__ActionOrange {
    color: var(--action-orange)!important;
  }
  .MuiPaper-root.MuiDialog-paper {
    border-radius: 16px;
    background: #45354c;
  }
`;
