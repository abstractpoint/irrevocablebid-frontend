import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 60px;
  height: 90px;
  margin-bottom: 20px;
`;

export const Logo = styled.div`
  background-image: url(${(props: { bg: string }) => props.bg});
  height: 50px;
  width: 200px;
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
`;

export const Wallet = styled.div`
  display: flex;
`;

export const Button = styled.button`
  background-color: var(--action-orange);
  width: 284px;
  height: 81px;
  border-radius: 26px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;
