## [Документация](./docs/index.md)

%env(resolve:UPLOADS_PARENT)% - мы выбрали "private/"

%env(resolve:UPLOADS_PARENT)%/upload/00 - основное хранилище
%env(resolve:UPLOADS_PARENT)%/upload/imgproc - временная папка для обработки пресетов (после обработки удаляется из нее - должна быть пустой в идеале)
%env(resolve:UPLOADS_PARENT)%/upload/import - не для приложения.. просто хранилище для транзита файлов или дампов или всякий отстойник...
%env(resolve:UPLOADS_PARENT)%/upload/temp - папка для записи чанков при загрузке и сборки файлов впоследствии
