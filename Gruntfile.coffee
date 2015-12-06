module.exports = (grunt) ->
    grunt.config.init
        connect:
            server:
                options:
                    protocol: 'http'
                    hostname: '*'
                    port: 8000
                    base: '.'
                    keepalive: true

    # -----------------------------------
    # register task
    # -----------------------------------
    grunt.registerTask 'serve', [
        'connect'
    ]

    # -----------------------------------
    # Plugins
    # -----------------------------------
    grunt.loadNpmTasks 'grunt-contrib-connect'