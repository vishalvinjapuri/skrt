import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  TouchableHighlight
} from "react-native";
import { SwipeListView } from 'react-native-swipe-list-view';
import InputSpinner from "react-native-input-spinner";
import visa from '../../assets/mastercard.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 


const ScreenContainer = ({ children }) => (
    <View style = {styles.container_2}>{children}</View>
)

var quantity_states = [];


  const getData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      console.log(jsonValue != null ? JSON.parse(jsonValue) : null)
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      // error reading value
      alert('Something went wrong reading your cart, please restart the app.');
    }
  }

const fetchAllItems = async () => {
  try {
      console.log("fetchAllItems called")
      const keys = await AsyncStorage.getAllKeys()
      const items = await AsyncStorage.multiGet(keys)
      var cart_listData = [];
      var total = 0;

      var element;
      for (var i = 0; i < items.length; i++) {
        element = items[i];
        var itemDetails = JSON.parse(element[1])
        cart_listData.push({
          "key": i.toString(),
          "barcode": element[0],
          "text": itemDetails.name,
          "quantity": quantity_states[i][0],
          "price": itemDetails.price
        })
        total += quantity_states[i][0] * itemDetails.price; 
      }
      return [cart_listData, total];
  } catch (error) {
      console.log(error, "problemo")
  }
}

export const Cart = ({ navigation }) => {

    const [totalState, setTotalState] = useState(0)
    const [listData, setListData] = useState([]);

    for (var i = 0; i < 20; i++) {
      var startingQuantity = 0;
      if (i < listData.length-1) {
        startingQuantity = listData[i].quantity;
      }
      quantity_states.push([]);
      [quantity_states[i][0], quantity_states[i][1]] = useState(1);
    }

    useFocusEffect(
      React.useCallback(() =>  {
        console.log("focused")
        async function updateList(){
          const [fetched_data, total] = await fetchAllItems();
          setListData(fetched_data);
          setTotalState(total)
        }
        updateList();
      }, [])
    );



  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
        rowMap[rowKey].closeRow();
    }
  };

  const deleteRow = (rowMap, rowKey) => {
      closeRow(rowMap, rowKey);
      const newData = [...listData];
      const prevIndex = listData.findIndex(item => item.key === rowKey);
      console.log(listData[prevIndex])

      console.log("old total ", totalState, "subtracting", listData[prevIndex].price * quantity_states[prevIndex][0])
      var newTotal = totalState - (listData[prevIndex].price * quantity_states[prevIndex][0])
      newTotal = Math.round(newTotal * 100) / 100
      setTotalState(newTotal)

      AsyncStorage.removeItem(listData[prevIndex].barcode)
      newData.splice(prevIndex, 1);

      setListData(newData);

  };

  const onRowDidOpen = rowKey => {
      console.log('This row opened', rowKey);
  };

  const renderItem = data => (
        <TouchableHighlight
            onPress={() => console.log('You touched me')}
            style={styles.rowFront}
            underlayColor={'#AAA'}
        >
          <View style={{flexDirection: "row", paddingLeft: 10}}>
              <View style={{
                flex: 1,
                justifyContent: "center"
              }}>
                <Text style={{fontSize: 20}}>
                  {data.item.text}
                </Text>
              </View>

              <View style={{flex: 0.9, justifyContent:"center"}}>
                <InputSpinner
                  min={1}
                  step={1}
                  skin="paper"
                  style={{width: "80%"}}
                  colorMax={"#f04048"}
                  colorMin={"#40c5f4"}
                  editable={false}
                  fontSize={25}
                  value={quantity_states[data.item.key][0]}
                  onChange={(num) => {
                    quantity_states[data.item.key][1](num);

                  }}
                  onIncrease={(increased) => {
                    var newTotal = totalState + parseFloat(data.item.price)
                    newTotal = Math.round(newTotal * 100) / 100
                    setTotalState(newTotal)
                    console.log("new total " + global.total)
                  }}
                  onDecrease={(decreased) => {
                    var newTotal = totalState - parseFloat(data.item.price)
                    newTotal = Math.round(newTotal * 100) / 100
                    setTotalState(newTotal)
                    console.log("new total " + global.total)
                  }}
                />
              </View>


              <View style={{
                flex: 0.5,
                justifyContent: "center"
              }}>
                  <Text style={{fontWeight: "bold", fontSize: 20}}>{"$" + (Math.round(data.item.price * quantity_states[data.item.key][0] * 100)/100).toFixed(2)}</Text>
              </View>
          </View>
        </TouchableHighlight>
  );

  const renderHiddenItem = (data, rowMap) => (
      <View style={styles.rowBack}>
          <Text>Left</Text>
          <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnLeft]}
              onPress={() => closeRow(rowMap, data.item.key)}
          >
              <Text style={styles.backTextWhite}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight]}
              onPress={() => deleteRow(rowMap, data.item.key)}
          >
              <Text style={styles.backTextWhite}>Delete</Text>
          </TouchableOpacity>
      </View>
  );

    var getDoubleHeight = function(){
      return 2 * StatusBar.currentHeight;
    };

    return (
      <ScreenContainer>
          <View style={
            {
              flex: 10,
              paddingTop: 40
            }
          }>
            <SwipeListView
                data={listData}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                leftOpenValue={75}
                rightOpenValue={-150}
                previewRowKey={'0'}
                previewOpenValue={-40}
                previewOpenDelay={3000}
                onRowDidOpen={onRowDidOpen}
            />
          </View>

          <View style={{flex: 1, justifyContent: 'flex-end', flexDirection:"row"}}>

              <TouchableOpacity
                style={{
                  flex: 0.25,
                  height: "100%",
                  backgroundColor: '#338BA8',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={() => {navigation.navigate("Payment")}}>
                  <Image source={visa} style={{ width: "40%", height: "40%"}} /> 
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 0.75,
                  height: "100%",
                  backgroundColor: '#1cb51c',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {console.log("hi")}}>
                <Text style={{color: 'white', fontSize: 16}}>Checkout - <Text style={{fontWeight:"bold"}}>{"$" + totalState.toFixed(2)}</Text></Text>
              </TouchableOpacity>

          </View>

      </ScreenContainer>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
  
    container_2: {
      flex: 1,
      backgroundColor: "#fff"
    },
   
    backTextWhite: {
      color: '#FFF',
      fontSize: 20
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 100,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
    },
    backRightBtnLeft: {
        backgroundColor: 'black',
        right: 75,
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0,
    }
  });
  