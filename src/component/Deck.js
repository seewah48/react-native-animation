import React, {Component} from 'react'
import {View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager} from 'react-native'
import { Card } from 'react-native-elements';

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = 0.25* SCREEN_WIDTH
const SWIPE_OUT_DURATION = 250

class Deck extends React.Component{

  static defaultProps = {
    onSwipeLeft : () => {},
    onSwipeRight : () => {}
  } 

  constructor(props){
    super(props)

    const position = new Animated.ValueXY();

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder : () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({x:gesture.dx, y:gesture.dy})
      },
      onPanResponderRelease : (event, gesture)=>{
        if(gesture.dx > SWIPE_THRESHOLD){
          this.foreceSwipeRight('right');
        }else if(gesture.dx < - SWIPE_THRESHOLD){
          this.foreceSwipeRight('left');
        } else{
          this.resetPosition();
        }
      }
    });

    this.state = {panResponder, position, index: 0};
  }
componentWillReceiveProps(nextProps){
  if(nextProps.data != this.props.data){
    this.setState({index: 0});
  }

}

  componentWillUpdate(){
    UIManager.setLayoutAnimationEnabledExperimental 
    && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();

  }

  foreceSwipeRight(direction){
    const x = direction === 'right'? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: {x: SCREEN_WIDTH , y: 0},
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));

  }

  onSwipeComplete(direction){

    const {onSwipeRight , onSwipeLeft, data} = this.props
    const item = data[this.state.index]
    direction = 'right' ? onSwipeRight(item): onSwipeLeft(item);
    this.state.position.setValue({x:0 , y:0});
    this.setState({index: this.state.index + 1})
  }

  resetPosition(){
    Animated.spring(this.state.position,{
      toValue: {x:0 , y:0}
    }).start();
  }

  getCardStyle(){
    const {position} = this.state;
    const rotate = position.x.interpolate({
      inputRange : [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange : ['-120deg', '0deg', '120deg']
    });

    return{ 
      ...position.getLayout(),
      transform : [{ rotate}]
    };

  }

  renderCards(){
    if(this.state.index >= this.props.data.length){
      return this.props.renderNoMoreCards();
    }
    return this.props.data.map((item, id) => {
      if(id < this.state.index){return null}

      if(this.state.index === id){
        return (
      <Animated.View
      key = {item.id}
      style = {this.getCardStyle()}
       {...this.state.panResponder.panHandlers}
       >
       {this.props.renderCard(item)}
      </Animated.View>
        );
      }
      return (
        <Animated.View 
        key = {item.id} 
        style = {[styles.cardStyle, {top: 10*(id - this.state.index)}]}>
      {this.props.renderCard(item)}
      </Animated.View>
      );
    }).reverse();
  }

render(){
    return (
        <View>
        {this.renderCards()}
        </View>

    );
  }
}

const styles ={
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
} 

export default Deck;
