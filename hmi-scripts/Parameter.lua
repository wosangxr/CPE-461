Parameter_limits = 11

MQTT_URL = "tcp://broker.emqx.io:1883"
MQTT_CLIENT_ID = "smartfix_pistudio_01"

MQTT_USERNAME = ""
MQTT_PASSWORD = ""

MQTT_KEEPALIVE = 60
MQTT_QOS = 0

TOPIC_REQUEST = "repair/request"
TOPIC_COMMAND = "repair/command"
TOPIC_STATUS = "repair/status"

TOPIC_DASHBOARD = "repair/dashboard"
TOPIC_RESPONSE = "repair/response"

-- MQTT Status Address
-- X30 = 0 Offline
-- X30 = 1 Connecting
-- X30 = 2 Connected

MQTT_STATUS_ADDRESS = "@Conn:Stat:Reg:Addr:ByOrder:JZ_W_1:0:X:24:0:28416"