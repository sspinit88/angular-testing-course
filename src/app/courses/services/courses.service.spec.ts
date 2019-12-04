import { CoursesService } from './courses.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { COURSES, findLessonsForCourse, LESSONS } from '../../../../server/db-data';
import { Course } from '../model/course';
import { HttpErrorResponse } from '@angular/common/http';


describe('CoursesService', () => {

  let coursesService: CoursesService;
  // TODO позволяет имитировать и сбрасывать запросы.
  let httpTestingController: HttpTestingController;

  const changes: Partial<Course> = { titles: { description: 'Testing Course' } };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        // TODO вместо HttpClient для тестов подключаем
        HttpClientTestingModule,
      ],
      providers: [
        CoursesService,
      ],
    });

    coursesService = TestBed.get(CoursesService);
    httpTestingController = TestBed.get(HttpTestingController);

  });


  it('должны найти все курсы', () => {

    coursesService
      .findAllCourses()
      .subscribe(courses => {

        // TODO toBeTruthy() - логический сопоставитель используется, чтобы проверить, равен ли результат истине или ложи.
        expect(courses)
          .toBeTruthy('Курсы не были получены!');

        expect(courses.length)
          .toBe(12, 'некорректное число полученных данных');

        const course = courses.find(c => c.id === 12);

        // TODO проверяем титульник полученного курса с id === 12
        expect(course.titles.description)
          .toBe('Angular Testing Course');

      });

    // TODO создаем серверный запрос
    const req = httpTestingController.expectOne('/api/courses');

    // TODO проверяем каким методом были получены данные
    expect(req.request.method).toEqual('GET');

    // TODO передаем некоторые фиксированные данные в наш запрос, которые как бы должен возвращать сервер
    req.flush({ payload: Object.values(COURSES) });

  });


  it('должен найти курс по id', () => {

    coursesService
      .findCourseById(12)
      .subscribe(course => {

        expect(course).toBeTruthy();

        expect(course.id).toBe(12, 'id не совпадает');

      });

    const req = httpTestingController.expectOne('/api/courses/12');

    expect(req.request.method).toEqual('GET');

    req.flush(COURSES[12]);

  });


  it('должен сохранять курс на сервере', () => {

    coursesService
      .saveCourse(12, changes)
      .subscribe(course => {

        expect(course.id).toBe(12, 'id не совпадает');

      });

    const req = httpTestingController.expectOne('/api/courses/12');

    expect(req.request.method).toEqual('PUT');

    // TODO проверяем тела запроса, отправленного на сервер методом PUT
    expect(req.request.body.titles.description)
      .toEqual(changes.titles.description);

    req.flush(
      {
        ...COURSES[12],
        ...changes,
      });

  });


  it('должен выдать ошибку, если не удалось сохранить курс', () => {

    coursesService
      .saveCourse(12, changes)
      .subscribe(
        () => fail('операция по сохранению курса провалилась'),
        (error: HttpErrorResponse) => {

          expect(error.status).toBe(500);

        }
      );

    const req = httpTestingController.expectOne('/api/courses/12');

    expect(req.request.method).toEqual('PUT');

    req.flush('сохранение курса провалено', { status: 500, statusText: 'Internal Server Error' });

  });


  it('должен найти урок по заданным параметрам', () => {

    coursesService
      .findLessons(12)
      .subscribe(lessons => {

        expect(lessons).toBeTruthy();

        expect(lessons.length).toBe(3);

      });

    const req = httpTestingController
      .expectOne(request => {
        return request.url === '/api/lessons';
      });

    expect(req.request.method).toEqual('GET');

    expect(req.request.params.get('courseId')).toEqual('12');
    expect(req.request.params.get('filter')).toEqual('');
    expect(req.request.params.get('sortOrder')).toEqual('asc');
    expect(req.request.params.get('pageNumber')).toEqual('0');
    expect(req.request.params.get('pageSize')).toEqual('3');

    req.flush({
      payload: findLessonsForCourse(12).slice(0, 3),
  })
    ;

  });


  afterEach(() => {
    // TODO убеждаемся, что других запросов на сервер не было
    httpTestingController.verify();
  });

});
