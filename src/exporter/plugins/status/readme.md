
### Status ###

This plugins allow your to export monitoring status to a REST endpoint

### Exemple ###
	exports:
          - type: status
            url: https://fake-url/post/
            monitorings: ['api', 'spa']

### Options ###

| Name  |Type|Description|Required|
|---|----|-----------|--------|
|*url*|`string`|url to post status|True|
|*monitorings*|`array of string`|monitoring types to filter for post|False|

