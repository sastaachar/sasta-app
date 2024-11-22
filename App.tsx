import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import * as React from "react"
import { LiveboardEmbed, init } from "./sdk";



export default function App() {
  const ref = useRef<WebView>(null);

  const [host, setHost] = useState("http://172.19.251.209:8088");
  const [isHome, setIsHome] = useState(false);

  const [isInitRun, setIsInitRun] = useState(false);

  const runInit = () => {
    init({
      host,
      authType: "TrustedAuthCookieless",
    })
    setIsInitRun(true)
  }

  return (
    <View style={styles.container}>
      <View style={{ top: 100, borderBlockColor: "red", borderWidth: 3 }}>
        <Text>TSE EMBED</Text>
      </View>
      {isInitRun ?   <LiveboardEmbed liveboardId="test" />  : <Text>Init not run</Text>}
      <View style={{ borderBlockColor: "red", borderWidth: 2 }}>
        <Text onPress={runInit}>Init</Text>
      </View>
      <SafeAreaView>
        <TextInput
          value={host}
          onChangeText={(text) => {
            setHost(text);
          }}
        />
      </SafeAreaView>

      <Text
        style={{ height: 100, borderWidth: 2 }}
        onPress={() => {
          Alert.alert("Factory reseting the device started...");
        }}
      >
        {isHome ? "EmbedVent RouteFired - HomeRoute" : ""}
      </Text>
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
