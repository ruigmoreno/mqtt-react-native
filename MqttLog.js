import React, {useEffect, useState} from 'react';
import init from 'react_native_mqtt';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});

export default function MqttLog (props){
  const { style } = props;
  const clientID = Math.floor(Math.random() * 10000) + 1;
  const [text, setText] = useState('');

  const [clientInfo, setClientInfo] = useState({
    BROKER: 'broker.mqttdashboard.com',
    PORT: '8000',
    TOPIC: 'WORLD'
  });
  
  const client = 
    new Paho.MQTT.Client(
      clientInfo.BROKER,
      Number(clientInfo.PORT),
      `clientId-${clientID}`
    )

  
  useEffect(() => {
    try{
      client.connect({onSuccess: onConnect, useSSL: false});
      console.log('Connected!');
    } catch (err) {
      console.log(`Can not connect. Error: ${err.message}.`);
    }
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    return () => client.disconnect();
  }, []);
  
  function pushText (entry) {
    setText(entry);
    console.log(entry);
  };

  function onConnect () {
    try{
      client.subscribe(clientInfo.TOPIC);
      pushText(`Client subscribed in Topic ${clientInfo.TOPIC}!`);
    } catch (err) {
      push('Client can not subscribed!');
      console.log(`Client can not subscribed! Error: ${err.message}.`);
    }
  };

  function onConnectionLost (responseObject) {
    if (responseObject.errorCode !== 0) {
      pushText(`connection lost: ${responseObject.errorMessage}`);
    }
  };

  function onMessageArrived (message) {
    pushText(`new message: ${message.payloadString}`);
  };

  return (
    <View style={style}>
      <Text style={{fontSize:20, marginBottom: 10}}>System Log</Text>
      <Text style={{fontSize: 18, alignContent: 'center'}}>{text}</Text>
    </View>
  );
}
