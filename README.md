lograbbit
==================
Introduction
------------------
This is a [node.js](http://www.nodejs.org) web interface to manage [logstash](http://www.logstash.net) and its configuation file. Support only Linux and Windows(test in CentOS and Windows 7 64bit)    
The function point:    
1.  start/end logstash agent    
2.  view/edit logstash config file, and start logstash with specified config file    
    
How to use it
-------------------
Download the zip, extract it and put files in the directory "/logstash-1.x.x/bin",     
run     
`node server.js`     
then use browser access     
`http://yourip:3000/`          
you can use it to manage logstash and its configuation file!
