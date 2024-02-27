import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Alert, Button, StyleSheet, Text, View, TextInput, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

const debugging = `
     // Debug
     console = new Object();
     console.log = function(...args) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({  type: "log", data: args.map(JSON.stringify).join(' ')})
      );
     };
     console.debug = console.log;
     console.info = console.log;
     console.warn = console.log;
     console.error = function(...args) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({  type: "error", data: args.map(JSON.stringify).join(' ')})
      );
     };

     window.addEventListener("message", function(event) {
      console.log("some message", event.data);
     })
     `;

export default function App() {

  const ref = useRef();

  const [host, setHost] = useState("http://172.19.214.193:8088")
  const [isHome, setIsHome] = useState(false);

  const sendMsgToPWA = () => {
    console.log("sendMsgToPWA");
    Alert.alert("Init sent...")
    if (ref?.current) {
      // const data = JSON.stringify({
      //   type: "embedReady",
      //   data: {
      //     host:
      //   }
      // })
      ref?.current?.injectJavaScript(
        `
        window.postMessage(JSON.stringify({type: "embedReady", data: {host: "${host}"}}));
        `
      );
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={{top: 100,
        borderBlockColor: "red",
        borderWidth: 3
      }}
      >
      <Text
      >TSE EMBED</Text>
      </View>
      <WebView
        ref={ref}
        source={{ uri: "http://192.168.1.8:8080" }}
        style={{
          borderColor: "blue",
          borderWidth: 2,
          width: 300,
          height: 200,
          maxHeight: 550,
          top: 100
        }}
        injectedJavaScriptBeforeContentLoaded={debugging}
        onMessage={(event) => {
          const eventData = JSON.parse(event.nativeEvent.data);
          if(eventData.type === "error") {
            console.log("ERROR : ", eventData.data);
            return;
          }
          if(eventData.type === "inHome") {
            setIsHome(true);
          }
          console.log(eventData.type, eventData.data);
        }}
        webviewDebuggingEnabled={true}
        onError={(event) => {
          console.log("error", event);
        }}
        onHttpError={(event) => {
          console.log("http error", event);
        }}
        renderError={(event) => {
          console.log("render error", event);
        }}
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
        onShouldStartLoadWithRequest={(e) => {
          console.log("onShouldStartLoadWithRequest", e);
          return true;
        }}
        renderLoading={() => {
          <Text>Loading...</Text>
        }}
        originWhitelist={['*']}
        setDisplayZoomControls={false}
      />
      <View style={{borderBlockColor: "red", borderWidth: 2}}>
      <Text onPress={sendMsgToPWA} >Init</Text>
      </View>
      <SafeAreaView>
      <TextInput value={host} onChangeText={(text)=> {
        setHost(text);
      }} />
      </SafeAreaView>
      
      <Text style={{height: 100, borderWidth: 2}} onPress={() => {
        Alert.alert("Factory reseting the device started...")
      }} >{isHome ? "EmbedVent RouteFired - HomeRoute" : ""}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    // flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
