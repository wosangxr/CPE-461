Script_BG_limits = 11

local mqtt = require("mqtt")
local json = require("json")

--------------------------------------------------
-- SMART FIX SERVICE CONFIG (SPU)
--------------------------------------------------

local MQTT_URL = "tcp://broker.emqx.io:1883"
local MQTT_CLIENT_ID = "SmartFix_HMI_SPU"

local MQTT_USERNAME = ""
local MQTT_PASSWORD = ""

local MQTT_KEEPALIVE = 60
local MQTT_QOS = 0

--------------------------------------------------
-- TOPICS
--------------------------------------------------

local TOPIC_REQUEST   = "repair/request"
local TOPIC_STATUS    = "repair/status"
local TOPIC_COMMAND   = "repair/command"
local TOPIC_RESPONSE  = "repair/response"
local TOPIC_DASHBOARD = "repair/dashboard"

--------------------------------------------------
-- ADDRESS MAPPING (Option 1: X1 - X4)
--------------------------------------------------

local ADDRESS = {
    X1  = "1#X1",
    X2  = "1#X2",
    X3  = "1#X3",
    X4  = "1#X4",

    X10 = "1#X10",
    X11 = "1#X11",
    X12 = "1#X12",
    X13 = "1#X13",
    X14 = "1#X14",

    X21 = "1#X21",
    X22 = "1#X22",
    X23 = "1#X23",
    X24 = "1#X24",

    X25 = "1#X25",
    X26 = "1#X26",
    X27 = "1#X27"
}

-- Mapping หมายเลข HDW สำหรับหน้าจอ HMI
local HDW_NUM = {
    X1  = 1,
    X2  = 2,
    X3  = 3,
    X4  = 4,

    X10 = 10,
    X11 = 11,
    X12 = 12,
    X13 = 13,
    X14 = 14,

    X21 = 21,
    X22 = 22,
    X23 = 23,
    X24 = 24,

    X25 = 25,
    X26 = 26,
    X27 = 27
}

local LABELS = {
    X1  = "Total",
    X2  = "Pending",
    X3  = "Processing",
    X4  = "Done",

    X10 = "Computer",
    X11 = "Printer",
    X12 = "Network",
    X13 = "Other",
    X14 = "Fix Select",

    X21 = "Pending Item 1",
    X22 = "Pending Item 2",
    X23 = "Pending Item 3",
    X24 = "Pending Item 4",

    X25 = "Pending Select",
    X26 = "Processing Select",
    X27 = "Done Select"
}

local client = nil
local connected = false
local subscribed = false

local lastConnect = 0
local lastPublish = 0
local lastPoll = 0

local lastDashboard = ""
local lastButtonValues = {}

local function getTick()
    local result = we_bas_gettickcount()
    if result == nil then return 0 end
    return tonumber(result) or 0
end

local function readX(key)
    local val = 0
    local hdw_num = HDW_NUM[key]
    if hdw_num ~= nil then
        val = tonumber(we_bas_getword("0#HDW" .. hdw_num)) or 0
        if val == 0 then
            val = tonumber(we_bas_getword("HDW" .. hdw_num)) or 0
        end
        if val == 0 then
            val = tonumber(we_bas_getword(string.format("@HDW_W_%07d", hdw_num))) or 0
        end
    end

    if val == 0 and ADDRESS[key] ~= nil then
        val = tonumber(we_bas_getword(ADDRESS[key])) or 0
    end

    return val
end

local function writeX(key, value)
    value = tonumber(value) or 0
    if value < 0 then value = 0 end

    -- 1. เขียนลง 1#X (Device Station 1)
    if ADDRESS[key] ~= nil then
        we_bas_setword(ADDRESS[key], value)
    end

    -- 2. เขียนลง HDW ทุกรูปแบบ (เพื่อให้หน้าจอ HMI Simulation แสดงผลทันที)
    local hdw_num = HDW_NUM[key]
    if hdw_num ~= nil then
        we_bas_setword("0#HDW" .. hdw_num, value)
        we_bas_setword("HDW" .. hdw_num, value)
        we_bas_setword(string.format("@HDW_W_%07d", hdw_num), value)
    end

    return true
end

local function readAllAddress()
    local data = {}
    for key, _ in pairs(ADDRESS) do
        data[key] = readX(key)
    end
    return data
end

local function getDashboard()
    local addressData = readAllAddress()
    return {
        total = addressData.X1,
        pending = addressData.X2,
        processing = addressData.X3,
        done = addressData.X4,

        computer = addressData.X10,
        printer = addressData.X11,
        network = addressData.X12,
        other = addressData.X13,

        fix_select = addressData.X14,

        item1 = addressData.X21,
        item2 = addressData.X22,
        item3 = addressData.X23,
        item4 = addressData.X24,

        pending_select = addressData.X25,
        processing_select = addressData.X26,
        done_select = addressData.X27,

        address = addressData,
        labels = LABELS
    }
end

local function publish(topic, data)
    if client == nil or not connected then return false end

    local encodeOK, encodeResult = pcall(json.encode, data)
    if not encodeOK or encodeResult == nil then return false end

    local result, err = client:publish(topic, encodeResult, MQTT_QOS, 0)
    if result then
        return true
    else
        return false
    end
end

local function publishDashboard()
    publish(TOPIC_DASHBOARD, getDashboard())
end

local function publishAddress()
    publish("repair/address", {
        address = readAllAddress(),
        labels = LABELS
    })
end

local function sendResponse(command, result, extra)
    local data = getDashboard()
    data.command = command
    data.result = result
    if extra ~= nil then data.extra = extra end
    publish(TOPIC_RESPONSE, data)
end

local function updateCounts(data)
    if data.total ~= nil then writeX("X1", data.total) end
    if data.pending ~= nil then writeX("X2", data.pending) end
    if data.processing ~= nil then writeX("X3", data.processing) end
    if data.done ~= nil then writeX("X4", data.done) end
end

local function updateAddresses(data)
    -- Option 1: X1 - X4
    if data.X1 ~= nil then writeX("X1", data.X1) end
    if data.X2 ~= nil then writeX("X2", data.X2) end
    if data.X3 ~= nil then writeX("X3", data.X3) end
    if data.X4 ~= nil then writeX("X4", data.X4) end

    -- รองรับ X24 - X27
    if data.X24 ~= nil then writeX("X1", data.X24); writeX("X24", data.X24) end
    if data.X25 ~= nil then writeX("X2", data.X25); writeX("X25", data.X25) end
    if data.X26 ~= nil then writeX("X3", data.X26); writeX("X26", data.X26) end
    if data.X27 ~= nil then writeX("X4", data.X27); writeX("X27", data.X27) end

    if data.X10 ~= nil then writeX("X10", data.X10) end
    if data.X11 ~= nil then writeX("X11", data.X11) end
    if data.X12 ~= nil then writeX("X12", data.X12) end
    if data.X13 ~= nil then writeX("X13", data.X13) end
    if data.X14 ~= nil then writeX("X14", data.X14) end

    if type(data.address) == "table" then
        for key, value in pairs(data.address) do
            if ADDRESS[key] ~= nil then writeX(key, value) end
        end
    end
end

local function receiveMessage(topic, message)
    local decodeOK, data = pcall(json.decode, message)
    if not decodeOK or type(data) ~= "table" then return end

    if topic == TOPIC_STATUS then
        updateCounts(data)
        updateAddresses(data)
        publishDashboard()
        publishAddress()
        sendResponse("status_update", "ok")

    elseif topic == TOPIC_COMMAND or string.find(tostring(topic), "command") then
        local command = tostring(data.command or "")

        if command == "get_dashboard" or command == "get_list" then
            publishDashboard()
            publishAddress()
            sendResponse(command, "ok")

        elseif command == "get_address" then
            publishAddress()
            sendResponse(command, "ok")

        elseif command == "set_counts" or command == "set counts" then
            updateCounts(data)
            publishDashboard()
            sendResponse(command, "updated")

        elseif command == "set_address" or command == "set address" then
            updateAddresses(data)
            updateCounts(data)
            publishDashboard()
            publishAddress()
            sendResponse(command, "updated")

        elseif command == "set_status" or command == "set status" then
            if data.x_code ~= nil and data.value ~= nil then
                writeX(tostring(data.x_code), data.value)
            end
            publishDashboard()
            sendResponse(command, "updated")

        elseif command == "reset_counts" or command == "reset counts" then
            writeX("X1", 0)
            writeX("X2", 0)
            writeX("X3", 0)
            writeX("X4", 0)
            publishDashboard()
            sendResponse(command, "reset")

        elseif command == "reset_all" or command == "reset all" then
            for key, _ in pairs(ADDRESS) do
                writeX(key, 0)
            end
            publishDashboard()
            publishAddress()
            sendResponse(command, "reset_all")

        else
            updateAddresses(data)
            updateCounts(data)
            publishDashboard()
            sendResponse(command, "updated")
        end

    elseif topic == TOPIC_REQUEST then
        writeX("X1", readX("X1") + 1)
        writeX("X2", readX("X2") + 1)

        local device = tostring(data.device or data.type or data.category or "")
        local dlow = device:lower()
        if string.find(dlow, "computer") then
            writeX("X10", readX("X10") + 1)
        elseif string.find(dlow, "printer") then
            writeX("X11", readX("X11") + 1)
        elseif string.find(dlow, "network") then
            writeX("X12", readX("X12") + 1)
        else
            writeX("X13", readX("X13") + 1)
        end

        publishDashboard()
        publishAddress()
        publish(TOPIC_RESPONSE, {
            command = "new_request",
            result = "received",
            total = readX("X1"),
            pending = readX("X2"),
            device = device
        })
    else
        updateAddresses(data)
        updateCounts(data)
        publishDashboard()
    end
end

local function subscribeTopics()
    if client == nil or not connected then return end

    local topics = { TOPIC_REQUEST, TOPIC_STATUS, TOPIC_COMMAND, "repair/#" }
    for i = 1, #topics do
        client:subscribe(topics[i], MQTT_QOS)
    end
    subscribed = true
end

local function mqttInitialize()
    if client ~= nil then return end

    local err
    client, err = mqtt.create(MQTT_URL, MQTT_CLIENT_ID, 1)
    if client == nil then return end

    -- Event สำหรับรับข้อความ MQTT จากภายนอกใน PIStudio คือ "message"
    client:on("message", function(topic, message)
        receiveMessage(topic, message)
    end)

    -- Event "arrived" เพื่อรองรับทุกเวอร์ชัน
    client:on("arrived", function(topic, message)
        receiveMessage(topic, message)
    end)

    client:on("offline", function(cause)
        connected = false
        subscribed = false
    end)
end

local function mqttConnect()
    if client == nil then mqttInitialize() end
    if client == nil then return end

    if client:isconnected() then
        connected = true
        if not subscribed then subscribeTopics() end
        return
    end

    connected = false
    subscribed = false

    local now = getTick()
    if now - lastConnect < 5000 then return end
    lastConnect = now

    local config = {
        username = MQTT_USERNAME,
        password = MQTT_PASSWORD,
        keepalive = MQTT_KEEPALIVE,
        cleansession = 1
    }

    local result, err = client:connect(config)
    if result then
        connected = true
        subscribeTopics()
        publishDashboard()
        publishAddress()
    else
        connected = false
        subscribed = false
    end
end

local function checkButtons()
    local buttons = {
        "X1", "X2", "X3", "X4",
        "X10", "X11", "X12", "X13", "X14",
        "X21", "X22", "X23", "X24",
        "X25", "X26", "X27"
    }

    for i = 1, #buttons do
        local key = buttons[i]
        local plc_val = 0
        if ADDRESS[key] ~= nil then
            plc_val = tonumber(we_bas_getword(ADDRESS[key])) or 0
        end

        local hdw_val = 0
        local hnum = HDW_NUM[key]
        if hnum ~= nil then
            hdw_val = tonumber(we_bas_getword("0#HDW" .. hnum)) or 0
            if hdw_val == 0 then
                hdw_val = tonumber(we_bas_getword("HDW" .. hnum)) or 0
            end
        end

        -- ถ้าปุ่มบนจอ HMI เขียนลง 1#X หรือ 0#HDW ให้รับค่าที่เปลี่ยน
        local value = plc_val
        if value == 0 and hdw_val ~= 0 then
            value = hdw_val
        end

        if lastButtonValues[key] == nil then
            lastButtonValues[key] = value
        elseif lastButtonValues[key] ~= value then
            lastButtonValues[key] = value

            -- Sync ทั้ง 1#X และ 0#HDW เพื่อให้จอแสดงผลและ PLC ตรงกัน
            writeX(key, value)

            publish("repair/selection", {
                address = key,
                value = value,
                label = LABELS[key] or key,
                timestamp = getTick()
            })

            publishDashboard()
        end
    end
end

local function periodicPublish()
    if not connected then return end

    local now = getTick()
    if now - lastPublish < 2000 then return end
    lastPublish = now

    local data = getDashboard()
    local payload = json.encode(data)
    if payload == nil then return end

    if payload ~= lastDashboard then
        if publish(TOPIC_DASHBOARD, data) then
            lastDashboard = payload
        end
    else
        publish("repair/heartbeat", {
            connected = true,
            timestamp = now
        })
    end
end

function we_bg_init()
    lastConnect = 0
    lastPublish = 0
    lastPoll = 0
    connected = false
    subscribed = false
    mqttInitialize()
end

function we_bg_poll()
    local now = getTick()
    if now - lastPoll < 500 then return end
    lastPoll = now

    mqttConnect()

    if connected then
        checkButtons()
        periodicPublish()
    end
end