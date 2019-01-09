<?php
/**
  * Контроллер для получения и обновления информации о сущностях каталога Link
  *
  */
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\LinkCreatedMessage;
use App\Message\LinkDeletedMessage;
use App\Service\LinkService;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Serializer\AppSerializer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

/**
  * Контроллер для получения и обновления информации о сущностях каталога Link
  *
  * @Route("/api/links")
  */
class LinkController extends AbstractController
{
    /**
      * Рендерит тестовую страницу
      *
      * @Route("/test", name="links")
      */
    public function index()
    {
        return $this->render('link/index.html.twig', [
            'controller_name' => 'LinkController',
        ]);
    }

    /**
      * Создает новую сущность Link
      *
      * @param Request $request Текущий объект клиентского запроса
      * @param LinkService $linkService Сервис для работы с сущностями типа "Link"
      * @param MessageBusInterface $bus Сервис для отправки сообщений в RabbitMQ
      *
      * @Route("/submit", name="links_create")
      */
    public function create(Request $request, LinkService $linkService, MessageBusInterface $bus)
    {

      $data = json_decode(
          $request->getContent(),
          true
      );
      $validationRespone = $linkService->validateForm($data);
      if($validationRespone[0] === false){
        $response = new JsonResponse();
        $response->setData([
          'error'=>$validationRespone[1]
        ]);
        $response->setStatusCode(400);
        return $response;
      }

      $resourceIds = explode(',',$data['resource']);

      foreach($resourceIds as $res_id){
        $post = $data;
        $user = $this->getUser();
        $username = $user->getUsername();
        $params = [
          'access'=> isset($post['access'])?$post['access']:null,
          'target'=> isset($post['target'])?$post['target']:null,
          'expires_by'=> isset($post['expires_by'])?$post['expires_by']:null,
          'comment'=> isset($post['comment'])?$post['comment']:null,
          'max_requests'=> isset($post['max_requests'])?$post['max_requests']:null,
          'created_by'=>$user,
          'resource'=>$res_id
        ];

        $link = $linkService->createLink($params);
        $linkId = $link->getId();
        $linkHash = $link->getHash();

        $custom_size = isset($post['size']['height'])&&isset($post['size']['width'])?$post['size']['width']."/".$post['size']['height']:null;

        $bus->dispatch(new LinkCreatedMessage($linkId, $linkHash, $username, $res_id, $custom_size));
      }
      return new Response();
    }

    /**
      * Проводит фалидацию полей формы для добавления ссылки
      *
      * @param Request $request Текущий объект клиентского запроса
      * @param LinkService $linkService Сервис для работы с сущностями типа "Link"
      *
      * @Route("/validateform/", name="links_validate_add_form")
      */
     public function validateForm(Request $request, LinkService $linkService){
       $data = json_decode(
           $request->getContent(),
           true
       );
       $response = new JsonResponse();
       $validationRespone = $linkService->validateForm($data);
       if($validationRespone[0] === false){
         $response->setData([
           'error'=>$validationRespone[1]
         ]);
         $response->setStatusCode(400);
         return $response;
       }
       $response->setData([
         'error'=>null
       ]);
       return $response;
     }

    /**
      * Отдает текстовый файл с ссылками
      *
      * @param Request $request Текущий объект клиентского запроса
      * @param LinkService $linkService Сервис для работы с сущностями типа "Link"
      *
      * @Route("/txt/", name="links_get_txt")
      */
     public function getTxt(Request $request, LinkService $linkService){
       $links = $request->request->get('links');
       if(!isset($links)){
         throw new HttpException(400);
       }
       $urls = $linkService->getUrls($links);
       $response = new Response($urls);
       $disposition = $response->headers->makeDisposition(
         ResponseHeaderBag::DISPOSITION_ATTACHMENT,
        'links.txt'
       );
       $response->headers->set('Content-Disposition', $disposition);
       $response->headers->set('Content-Length', strlen($urls));
       $response->headers->set('Cache-Control', 'public');
       $response->headers->set('Content-Description', 'File Transfer');
       $response->headers->set('Content-Transfer-Encoding', 'binary');
       $response->headers->set('Content-Type', 'binary/octet-stream');
       return $response;
     }

    /**
      * Обновляет запись о ссылке
      *
      * @param int $link_id id бъекта ссылки в базе данных
      * @param Request $request Текущий объект клиентского запроса
      * @param LinkService $linkService Сервис для работы с сущностями типа "Link"
      *
      * @Route("/update/{link_id}", name="links_update")
      */
     public function updateLink($link_id, Request $request, LinkService $linkService)
     {
        $user = $this->getUser();
        $data = json_decode(
            $request->getContent(),
            true
        );
        $params = $data;
        if($linkService->userIsOwner($link_id, $user->getId())){
            $linkService->updateLink($params);
        }else{
            throw new HttpException(403);
        }
        $response = new JsonResponse();
        return $response;
     }

    /**
      * Возвращает изображение по ссылке
      *
      * @param string $link_hash Уникальный идентификатор ссылки
      * @param Request $request Текущий объект клиентского запроса
      * @param LinkService $linkService Сервис для работы с сущностями типа "Link"
      *
      * @Route("/get/{link_hash}.jpg", name="links_get")
      */
     public function getResource($link_hash, Request $request, LinkService $linkService)
     {
        $user = $this->getUser();
        $imageData = $linkService->getImageData($link_hash, $request, $user);
        $image = $imageData['content'];
        $headers = array(
          'Content-Type'     => 'image/jpeg',
          'Content-Disposition' => 'inline; filename="'.$imageData['filename'].'"');
        return new Response($image, 200, $headers);
     }

     /**
       *
       * Получает список всех ссылок для текущего пользователя
       *
       * @param Request $request Текущий объект клиентского запроса
       * @param LinkService $linkService Сервис для работы с сущностями типа "Link"
       * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
       *
       * @Route("/fetchall", name="links_fetch_all")
       */
      public function fetchAll(Request $request, LinkService $linkService, AppSerializer $serializer)
      {
         $user = $this->getUser();
         $links = $linkService->fetchAllWithExtraFields($user);

         // Альтернативный способ получения линков если нет нужды в полях, привязанных к сущностям Resource и CatalogueNodeItem
         // $links = $linkService->fetchAllForUser($user);
         // $links = $serializer->normalize($links, null, array(
         //     ObjectNormalizer::ENABLE_MAX_DEPTH => true,
         //     'groups' => array('main')
         // ));
         $response = new JsonResponse($links);
         return $response;
      }

      /**
        * Удаляет запись о ссылке, и, если она не указывала на ресурс, сгенерированный файл
        *
        * @param int $link
        * @param Request $request Текущий объект клиентского запроса
        * @param LinkService $linkService Сервис для работы с сущностями типа "Link"
        * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
        * @param MessageBusInterface $bus Сервис для отправки сообщений в RabbitMQ
        *
        * @Route("/delete/{link}", name="links_delete")
        */
       public function delete($link, Request $request, LinkService $linkService, AppSerializer $serializer, MessageBusInterface $bus)
       {
          $user = $this->getUser()->getId();
          $bus->dispatch(new LinkDeletedMessage($link, $user));
          $response = new JsonResponse();
          return $response;
       }


}
