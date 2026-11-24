-- 1. ฟังก์ชันรับข้อมูลจาก MQTT แล้วเขียนลง Register บนหน้าจอ
function mqtt_msg_callback(topic, msg)
    local ok, d = pcall(json.decode, msg)
    if not ok or type(d) ~= "table" then
        return
    end

    local v = d.data or d

    -- 1. คำร้องทั้งหมด (HDW1) จาก total หรือ X1 หรือ X24
    if v.total ~= nil then
        we_bas_setword("@HDW_W_0000001", tonumber(v.total))
    elseif v.X1 ~= nil then
        we_bas_setword("@HDW_W_0000001", tonumber(v.X1))
    elseif v.X24 ~= nil then
        we_bas_setword("@HDW_W_0000001", tonumber(v.X24))
        we_bas_setword("@HDW_W_0000024", tonumber(v.X24))
    end

    -- 2. รอดำเนินการ (HDW2) จาก fix_select หรือ X2 หรือ X25
    if v.fix_select ~= nil then
        we_bas_setword("@HDW_W_0000002", tonumber(v.fix_select))
    elseif v.X2 ~= nil then
        we_bas_setword("@HDW_W_0000002", tonumber(v.X2))
    elseif v.X25 ~= nil then
        we_bas_setword("@HDW_W_0000002", tonumber(v.X25))
        we_bas_setword("@HDW_W_0000025", tonumber(v.X25))
    end

    -- 3. กำลังดำเนินการ (HDW3) จาก processing_select หรือ X3 หรือ X26
    if v.processing_select ~= nil then
        we_bas_setword("@HDW_W_0000003", tonumber(v.processing_select))
    elseif v.X3 ~= nil then
        we_bas_setword("@HDW_W_0000003", tonumber(v.X3))
    elseif v.X26 ~= nil then
        we_bas_setword("@HDW_W_0000003", tonumber(v.X26))
        we_bas_setword("@HDW_W_0000026", tonumber(v.X26))
    end

    -- 4. สำเร็จ (HDW4) จาก done_select หรือ X4 หรือ X27
    if v.done_select ~= nil then
        we_bas_setword("@HDW_W_0000004", tonumber(v.done_select))
    elseif v.X4 ~= nil then
        we_bas_setword("@HDW_W_0000004", tonumber(v.X4))
    elseif v.X27 ~= nil then
        we_bas_setword("@HDW_W_0000004", tonumber(v.X27))
        we_bas_setword("@HDW_W_0000027", tonumber(v.X27))
    end
end