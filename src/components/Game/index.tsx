import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Route, Switch, useRouteMatch, withRouter, useHistory } from 'react-router';
import { Wrapper, View, Img } from '@bit/meema.ui-components.elements';
import styled, { css } from 'styled-components';
import { IAnimal } from 'greenpeace';
import { pixelToRem } from 'meema.utils';
import { SliderIcon } from '../../assets/images';
import Widgets from '../../components/Widgets'; 
import Animal, { Chip } from '../../components/Animal';
import { ArrowLeftIcon } from '../../assets/images';
import config from '../../config'; 
import ThreeCircles from '@bit/meema.ui-components.loaders.three-circles';
import { GameContext } from './context';
interface MatchParams {
  stepId?: string;
}

interface IProps extends RouteComponentProps<MatchParams> {}

const ProgressLine = styled(Wrapper)<{ finished: boolean }>`
  width: 100%;
  height: ${pixelToRem(4)};
  margin-right: ${pixelToRem(30)};
  margin-left: ${pixelToRem(30)};
  background-color: white;
  transform-origin: center center;
  transition: all 500ms ease;
  animation: bg-animation 1000ms infinite;

  ${(props) => (props.finished) && css`
    background: ${({theme}) => theme.color.primary.normal};
  `}
`;

const WrapperAnimal = styled(Wrapper)<{ size?: number; }>`
  --size: 46vw;
  
  @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
    --size: ${pixelToRem(310)};
  }
  
  @media (min-width: ${props => pixelToRem(props.theme.responsive.desktop.minWidth)}) {
    --size: ${pixelToRem(310)};
  }

  position: absolute;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  width: var(--size);
  height: var(--size);
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  opacity: 0;
  top: ${pixelToRem(40)};
  cursor: pointer;
  transition: all 250ms ease;

  &.fromLeft {
    left: calc(var(--size) * -1);
    animation-name: fromLeft;
    animation-duration: 750ms;

    @keyframes fromLeft {
      0% {
        left: calc(var(--size) * -1);
        opacity: 0;
      }
      100% {
        left: calc(48% - var(--size));
        opacity: 1;
      }
    }
  }

  &.toLeft {
    animation-name: toLeft;
    animation-duration: 500ms;

    @keyframes toLeft {
      0% {
        opacity: 1;
        left: calc(48% - var(--size));
      }
      100% {
        left: calc(var(--size) * -1);
        opacity: 0;
      }
    }
  }

  &.fromRight {
    animation-name: fromRight;
    animation-duration: 750ms;
    right: calc(var(--size) * -1);

    @keyframes fromRight {
      0% {
        right: calc(var(--size) * -1);
        opacity: 0;
      }
      100% {
        right: calc(48% - var(--size));
        opacity: 1;
      }
    }
  }

  &.toRight {
    animation-name: toRight;
    animation-duration: 500ms;
    
    @keyframes toRight {
      0% {
        opacity: 1;
        right: calc(48% - var(--size));
      }
      100% {
        right: calc(var(--size) * -1);
        opacity: 0;
      }
    }
  }
`;

const Game: React.FunctionComponent<IProps> = ({
  match,
}) => {
  const { path, params } = useRouteMatch();
  const history = useHistory();
  const [ maxSteps, setMaxSteps ] = useState<number>(0);
  const [ currentStep, setCurrentStep ] = useState<number>(1);
  const [ isSelected, setIsSelected ] = useState<boolean>(false);
  const [ players, setPlayers ] = useState<IAnimal[]>([]);
  const [ winners, setWinners ] = useState<IAnimal[]>([]);
  const [ losers, setLosers ] = useState<IAnimal[]>([]);
  const [ matches, setMatches ] = useState<any[]>([]);
  const { dispatch } = useContext(GameContext);

  const goPrev = useCallback(() => {
    setIsSelected(true);
    const timer = setTimeout(() => {
      const newUrl = match.path.replace(':stepId', `${currentStep - 1}`);
      history.replace(newUrl);
    }, 250);
    return () => clearTimeout(timer);
  }, [
    currentStep,
    history,
    match,
  ]);
  
  const goNext = useCallback(() => {
    setIsSelected(true);
    const timer = setTimeout(() => {
      if(currentStep >= maxSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        const newUrl = match.path.replace(':stepId', `${currentStep + 1}`);
        history.replace(newUrl);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [
    currentStep,
    maxSteps,
    history,
    match,
  ]);

  const onClickHandler = useCallback((animal_label: string) => {
    setWinners([...winners, ...players.filter((a: IAnimal) => a.label === animal_label)])
    setLosers([...losers, ...matches[currentStep - 1].filter((a: IAnimal) => a.label !== animal_label)]);
    goNext();
  }, [
    currentStep,
    isSelected,
    maxSteps,
    matches,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSelected(false);
    }, 750);
    return () => clearTimeout(timer);
  }, [
    currentStep,
    isSelected,
    path,
  ]);

  useEffect(() => {
    if(maxSteps > 0 && currentStep > maxSteps) {
      dispatch({type: 'UPDATE_USER_GAME_DATA', payload: winners });
      const timer = setTimeout(() => {
        history.push(`${match.url}/end`);
        const timer = setTimeout(() => {
          history.push(`/scanner`);
          return () => clearTimeout(timer);    
        }, 500);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [
    currentStep,
    maxSteps,
    history,
  ])

  useEffect(() => {
    if(match.params.stepId) {
      const stepId = parseInt(match.params.stepId);
      if(stepId < 1) {
        history.replace(match.path.replace(':stepId', '1'));
      } else {
        setCurrentStep(stepId);
      }
    }
  }, [
    match,
    history,
  ]);

  useEffect(() => {
    const groups = config.animals.reduce((a: any, b: IAnimal, c: number) => {
      if(c === 0) {
         return {
           [`${b.group}`]: [b],
         }
      } else {
        if(a[b.group]) {
          return {
            ...a,
            [`${b.group}`]: [...a[b.group]].concat(b),
          }
        } else {
          return {
            ...a,
            [`${b.group}`]: [b],
          }
        }
      }
    }, []);
   
    setMaxSteps(Math.ceil(Object.values(groups).length / 2));

    const players = Object.values(groups).reduce((a: any[], b: any, c: number) => {
      const idx = Math.round(Math.random() * (b.length - 1));
      return [...a].concat(b[idx]);
    }, []);

    setPlayers(players);
    setMatches(players.reduce((a: any, b: IAnimal, c: number) => {
      const temp = (c === 0) ? [] : a;
       if(c % 2 === 0) {
         temp.push([b])
         return temp;
       } else {
         temp[temp.length - 1].push(b);
       }
      return a;
    }, []));
  }, []);

  useEffect(() => {
    if(losers.length === matches.length - 1) {
      if(!matches[currentStep ][1]) {
        matches[currentStep].push(losers[Math.round(Math.random() * 1)]);
      }
    }
  }, [
    matches,
    losers,
  ]);

  return useMemo(() => (
    <Widgets.View
      customCss={css`
        padding-top: ${pixelToRem(5)};

        @media (min-width: ${props => pixelToRem(props.theme.responsive.mobile.minWidth)}) {
          padding-top: ${pixelToRem(15)};
        }
        
        @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
          padding-top: ${pixelToRem(30)};
        }
      `}
    >
      <Wrapper
        customCss={css`
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-bottom: ${pixelToRem(20)};
        `}
      >
        <Wrapper
          customCss={css`
            display: flex;
            flex: 1 0 15%;
            padding-left: ${pixelToRem(20)};
            align-items: center;
            justify-content: flex-start;
            overflow: hidden;

            @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
              padding-left: ${pixelToRem(40)};
            }
          `}
        >
          <Switch>
            <Route exact path={match.path}>
              <Wrapper
                onClick={goPrev}
                customCss={css`
                  color: white;
                  font-family: ${pixelToRem(50)} !important;
                  cursor: pointer;
                  opacity: 0;
                  pointer-events: none;
                  transform: translateX(-100vw);
                  margin-bottom: ${pixelToRem(20)};
                  transition: all 250ms ease-out;


                  ${(currentStep > 1) && css`
                    opacity: 1;
                    pointer-events: auto;
                    transform: translateX(0);
                  `}
                `}
              ><Img
                customCss={css`
                  margin-right:${pixelToRem(14)};
                `}
                src={ArrowLeftIcon}/>Volver al paso anterior</Wrapper>
            </Route>
          </Switch>
        </Wrapper>
        <Widgets.H1
          customCss={css`
            text-align: center !important;
            font-size: ${pixelToRem(28)} !important;
            padding: 0 10%;
            transition: all 250ms ease-out;

            @media (min-width: ${props => pixelToRem(props.theme.responsive.mobile.minWidth)}) {
              font-size: ${pixelToRem(34)} !important;
            }
            
            @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
              font-size: ${pixelToRem(50)} !important;
            }
          `}
        >Elegí con cuál te identificas más</Widgets.H1>
      </Wrapper>
      <Wrapper customCss={css`
        height: ${pixelToRem(40)};
        width: 100%;
        padding-top: 0;
        padding-bottom: 0;
        padding-left: 5%;
        padding-right: 5%;
        transition: all 500ms ease;

        @media (min-width: ${props => pixelToRem(props.theme.responsive.tablet.minWidth)}) {
          padding-left: 15%;
          padding-right: 15%;
        }
      `}>
        <Wrapper
          customCss={css`
            position: relative;
            align-items: center;
            display: flex;
            width: 100%;
            height: 100%;
          `}
        >
          <Wrapper
            customCss={css`
              width: 100%;
              display: flex;
              padding: 0 ${pixelToRem(40 / 2)};
            `}
          >
            {[...Array((maxSteps - 1 < 0) ? 0 : maxSteps - 1).keys()].map((step: number) => (
              <ProgressLine key={step} finished={currentStep > step + 1} />
            ))}
          </Wrapper>

          <Wrapper
            customCss={css`
              position: absolute;
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
            `}
          >
            {[...Array(maxSteps).keys()].map((step: number) => (
              <Wrapper
                key={step}
                customCss={css`
                  display: flex;
                  flex: 0 0 ${pixelToRem(40)};
                  height: ${pixelToRem(40)};
                  border: solid ${pixelToRem(1)} white;
                  color: white;
                  border-radius: 50%;
                  align-items: center;
                  justify-content: center;
                  font-family: ${props => props.theme.font.family.primary.bold};
                  font-size: ${pixelToRem(20)};
                  opacity: 1;
                  transition: all 600ms ease;
                  
                  ${(currentStep >= (step + 1)) && css`
                    background: white;
                    opacity: 1;
                    color: black;
                    transition-delay: 350ms;
                  `}
                `}
              >{step + 1}</Wrapper>
            ))}
          </Wrapper>
          <Img
            src={SliderIcon}
            customCss={css`
              position: absolute;
              top: 0;
              opacity: 1;
              transition: all 500ms ease-out;

              ${(currentStep === 1) ? css`
                left: 0%;
              ` : (currentStep === maxSteps) ? css`
                left: calc(100% - ${pixelToRem(40)});
              ` : (currentStep < maxSteps) ? css`
                left: calc(50% - ${pixelToRem(20)});
              ` : css`
                opacity: 0;
              `}
            `}
          />
        </Wrapper>
      </Wrapper>
      <Switch>
        <Route exact path={`${match.path}/end`}>
          <Wrapper
            customCss={css`
              padding: 10rem 0;
            `}
          >
            <ThreeCircles
              circleCss={css`
                background: white;
              `}
            />
          </Wrapper>
        </Route>
        <Route path={match.path}>
          <Wrapper
            customCss={css`
              position: relative;
              display: flex;
              flex-direction: column;
              width: 100%;

              @media (min-width: ${props => pixelToRem(props.theme.responsive.desktop.minWidth)}) {
                margin: ${pixelToRem(50)} 0;
                height: ${pixelToRem(450)};
              }
            `}>
              {
                (currentStep <= maxSteps && matches.length) && (
                  <>
                    <WrapperAnimal
                      className={`${isSelected ? 'toLeft' : 'fromLeft'}`}
                    >
                      {(players.length && matches.length) && (
                        <Animal
                          {...matches[currentStep - 1][0]}
                          showChip={true}
                          chipOrientation='left'
                          onClickHandler={onClickHandler}
                        />
                      )}
                      <Chip>{matches[currentStep - 1][0].name}</Chip>
                    </WrapperAnimal>

                    <WrapperAnimal
                      className={`${isSelected ? 'toRight' : 'fromRight'}`}
                    >
                      {(players.length && matches.length) && (
                        <Animal
                          {...matches[currentStep - 1][1]}
                          showChip={true}
                          chipOrientation='right'
                          onClickHandler={onClickHandler}
                        />
                      )}
                      {(matches[currentStep - 1]) && matches[currentStep - 1][1] ? (
                        <Chip>{matches[currentStep - 1][1].name}</Chip>
                      ) : null}
                    </WrapperAnimal>
                  </>
                )
              }
          </Wrapper>
        </Route>
      </Switch>
    </Widgets.View>
  ), [
    currentStep,
    maxSteps,
    isSelected,
    players,
    matches,
    history,
    path,
    winners,
    losers,
    match,
    dispatch,
  ]);
};

export default memo(withRouter(Game));
