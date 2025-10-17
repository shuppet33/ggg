import styled, { createGlobalStyle, keyframes } from "styled-components";

// ====================== Глобальные стили ======================
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background-color: #01060f;
    color: #00ffcc;
    font-family: 'JetBrains Mono', monospace;
    overflow-x: hidden;
    height: 100%;
  }
`;

// ====================== Анимации ======================
const glow = keyframes`
  from { text-shadow: 0 0 5px #00ffcc, 0 0 10px #00b3ff; }
  to { text-shadow: 0 0 20px #00ffcc, 0 0 40px #00b3ff; }
`;

// ====================== Стили ======================
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  padding: 16px;
`;

const Message = styled.h1`
  font-size: 2rem;
  color: #00ffcc;
  animation: ${glow} 2s ease-in-out infinite alternate;
`;

// ====================== КОМПОНЕНТ ======================
export const NoAccess = () => {
    return (
        <>
            <GlobalStyle />
            <Wrapper>
                <Message>🚫 NO ACCESS</Message>
            </Wrapper>
        </>
    );
};
