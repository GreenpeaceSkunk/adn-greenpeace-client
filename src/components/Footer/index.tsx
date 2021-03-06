import React from 'react';
import styled, { css } from 'styled-components';
import { Footer, Wrapper, Span, A, Nav } from '@bit/meema.ui-components.elements';
import { pixelToRem } from 'meema.utils';

const Link = styled(A)`
  color: white;
  text-decoration: underline;
  margin-bottom: ${pixelToRem(5)};
  
  @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
    margin-bottom: 0;
    
    &:after {
      content: '|';
      margin-right: ${pixelToRem(10)};
      margin-left: ${pixelToRem(10)};
    }
    
    &:last-child {
      &:after {
        display: none;
      }
    }
  }
`;

const MainFooter: React.FunctionComponent<{}> = () => (
  <Footer
    customCss={css`
      display: flex;
      flex-direction: column;
      /* justify-content: center; */
      justify-content: space-between;
      padding-top: ${pixelToRem(20)};
      padding-bottom: ${pixelToRem(20)};
      padding-left: ${pixelToRem(20)};
      padding-right: ${pixelToRem(20)}; 
      width: 100vw;
      height: ${({theme}) => pixelToRem(theme.footer.mobile.height)};
      background-color: ${({theme}) => theme.footer.mobile.backgroundColor};
      color: white;
      transition: all 250ms ease;
      z-index: 1;
      /* background-color: pink; */

      @media (min-width: ${({theme}) => pixelToRem(theme.responsive.tablet.minWidth)}) {
        padding-left: ${pixelToRem(40)};
        padding-right: ${pixelToRem(40)}; 
        height: ${({theme}) => pixelToRem(theme.footer.tablet.height)};
        background-color: ${({theme}) => theme.footer.tablet.backgroundColor};
      }

      @media (min-width: ${props => pixelToRem(props.theme.responsive.desktop.minWidth)}) {
        height: ${({theme}) => pixelToRem(theme.footer.desktop.height)};
        background-color: ${({theme}) => theme.footer.desktop.backgroundColor};
      }
    `}
  >
    <Nav customCss={css`
      display: flex;
      flex-direction: column;
      /* flex-direction: row; */
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 100%;
      /* background-color: orange; */
    
      @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
        flex-direction: row;
      }
    `}>
      <Wrapper customCss={css`
        display: flex;
        flex-direction: column;
        width: 100%;
        /* width: auto; */
        /* height: 100%; */
        align-items: center;
        /* justify-content: center; */
        /* margin-bottom: ${pixelToRem(10)}; */
        /* background-color: brown; */
        
        @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
          flex-direction: row;
          justify-content: center;
          margin-bottom: 0;
          width: auto;
        }
      `}>
        <Link
          href={`${process.env.REACT_APP_TERMS_AND_CONDITIONS_URL}`}
          >Términos y condiciones</Link>
        <Link
          href={`${process.env.REACT_APP_PRIVACY_POLICY_URL}`}
        >Politicas de privacidad</Link>
      </Wrapper>
      <Span
        customCss={css`
          color: white;
        `}
      >© Greenpeace Copyright</Span>
    </Nav>
  </Footer>
);

MainFooter.displayName = 'MainFooter';
export default MainFooter;