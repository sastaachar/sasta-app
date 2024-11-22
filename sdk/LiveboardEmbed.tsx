import { useRef } from "react";
import { Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { getEmbedConfig, AppUrl } from "./embedConfig";

export type LiveboardEmbedProps = {
  liveboardId: string;
};

const debuggerScript = `
    // Debug
    let postLogToAppFn = (type) => (...args) => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "TS_" + type, 
          data: args.map(JSON.stringify).join(' ')
        })
      );
    }
    console = new Object();
    console.log = postLogToAppFn("LOG");
    console.debug = postLogToAppFn("DEBUG");
    console.info = postLogToAppFn("INFO");
    console.warn = postLogToAppFn("WARN");
    console.error = postLogToAppFn("ERROR");
`;

export enum HostEvent {
  AppInit = "AppInit",
  GetData = "GetData",
  AuthExpiry = "AuthExpiry",
}

export enum EmbedEvent {
  AppInit = "AppInit",
  TS_WARN = "TS_WARN",
  TS_ERROR = "TS_ERROR",
  TS_LOG = "TS_LOG",
  TS_INFO = "TS_INFO",
  TS_DEBUG = "TS_DEBUG",
  AuthExpiry = "AuthExpiry",
}

export type PostMessagePayload =
  | {
      type: HostEvent.AppInit;
      data: {
        host: string;
        token: string;
        platform: string;
      };
    }
  | {
      type: HostEvent.GetData;
      data: {
        liveboardId: string;
      };
    }
  | {
      type: HostEvent.AuthExpiry;
      data: {
        authToken: string;
      };
    };

const tokenApi = async (host: string) => {
  const tokenRes = await fetch(host + "/api/rest/2.0/auth/token/full", {
    headers: {
      accept: "application/json",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/json",
    },
    body: '{"username":"tsadmin","validity_time_in_sec":10,"org_id":0,"auto_create":false,"password":"admin"}',
    method: "POST",
  });

  const token = (await tokenRes.json()).token;

  return token as string;
};

export const LiveboardEmbed: React.FC<LiveboardEmbedProps> = (props) => {
  const ref = useRef<WebView>(null);

  const sendDataToApp = (payload: PostMessagePayload) => {
    if (!ref.current) return;
    ref.current.postMessage(JSON.stringify(payload));
  };

  const handleAppInit = async () => {
    const host = getEmbedConfig()?.host || "";

    const token = await tokenApi(host);

    sendDataToApp({
      type: HostEvent.AppInit,
      data: {
        host,
        token,
        platform: "web",
      },
    });
  };

  const handleAppExpiry = async () => {
    const host = getEmbedConfig()?.host || "";

    const authToken = await tokenApi(host);

    console.log("Auth token", authToken);

    sendDataToApp({
      type: HostEvent.AuthExpiry,
      data: {
        authToken,
      },
    });
  };

  const handleOnMessage = (message: WebViewMessageEvent) => {
    try {
      const eventData = JSON.parse(message.nativeEvent.data);

      switch (eventData.type) {
        case EmbedEvent.TS_ERROR:
          // console.log("ERROR", eventData.data);
          break;
        // case EmbedEvent.TS_WARN:
        //   console.warn(eventData.data);
        //   break;
        // case EmbedEvent.TS_LOG:
        //   console.log(eventData.data);
        //   break;
        case EmbedEvent.TS_INFO:
          console.info(eventData.data);
          break;
        case EmbedEvent.TS_DEBUG:
          console.debug(eventData.data);
          break;
        case EmbedEvent.AppInit:
          handleAppInit();
          break;
        case EmbedEvent.AuthExpiry:
          handleAppExpiry();
          break;
        default:
          break;
      }
    } catch (error) {
      // console.warn("Could not parse message from WebView: ", message.nativeEvent.data);
    }
  };

  return (
    <WebView
      userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/75.0.3770.100 Mobile/13B143 Safari/601.1.46"
      ref={ref}
      source={{ uri: AppUrl }}
      style={{
        borderColor: "blue",
        borderWidth: 2,
        width: 300,
        height: 200,
        maxHeight: 550,
        top: 100,
      }}
      injectedJavaScriptBeforeContentLoaded={debuggerScript}
      onMessage={handleOnMessage}
      webviewDebuggingEnabled={true}
      onHttpError={(event) => {
        console.log("Http error", event);
      }}
      renderError={(_, _1, errorDesc) => {
        return <Text>Error : {errorDesc}</Text>;
      }}
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      renderLoading={() => {
        return <Text>Loading...</Text>;
      }}
      originWhitelist={["*"]}
      setDisplayZoomControls={false}
      thirdPartyCookiesEnabled={true}
      sharedCookiesEnabled={true}
      onError={(e) => {
        console.log(e.nativeEvent);
      }}
    />
  );
};
