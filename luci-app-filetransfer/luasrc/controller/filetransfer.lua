--[[
luci-app-filetransfer
Description: File upload / download
Author: yuleniwo  xzm2@qq.com  QQ:529698939
Modify: ayongwifi@126.com  www.openwrtdl.com
]]--

module("luci.controller.filetransfer", package.seeall)

local i18n = require "luci.i18n"
i18n.loadc("filetransfer")

function index()
    entry({"admin", "system", "filetransfer"}, view("filetransfer"), _("File Transfer"), 89).dependent = true

    entry({"admin", "system", "filetransfer", "list"}, call("action_list")).leaf = true
    entry({"admin", "system", "filetransfer", "upload"}, call("action_upload")).leaf = true
    entry({"admin", "system", "filetransfer", "delete"}, call("action_delete")).leaf = true
end

function action_list()
    local fs = require "nixio.fs"
    local files = {}

    for f in fs.dir("/tmp/upload") do
        table.insert(files, f)
    end

    luci.http.prepare_content("application/json")
    luci.http.write_json({ files = files })
end

function action_upload()
    local http = require "luci.http"
    local fs = require "nixio.fs"

    http.setfilehandler(function(meta, chunk, eof)
        if not meta then return end

        local path = "/tmp/upload/" .. meta.file
        local fp = io.open(path, "w")

        if chunk then fp:write(chunk) end
        if eof then fp:close() end
    end)
end

function action_delete()
    local http = require "luci.http"
    local fs = require "nixio.fs"

    local name = http.formvalue("name")
    if name then
        fs.remove("/tmp/upload/" .. name)
    end
end
