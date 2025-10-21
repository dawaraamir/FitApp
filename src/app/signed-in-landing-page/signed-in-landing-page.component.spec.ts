import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DataService } from '../data.service';
import { SignedInLandingPageComponent } from './signed-in-landing-page.component';

describe('SignedInLandingPageComponent', () => {
  let component: SignedInLandingPageComponent;
  let fixture: ComponentFixture<SignedInLandingPageComponent>;
  let dataServiceStub: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    dataServiceStub = jasmine.createSpyObj('DataService', ['fetchUser', 'fetchExercises', 'fetchUserById', 'editUser']);
    dataServiceStub.fetchUser.and.returnValue(of([]));
    dataServiceStub.fetchExercises.and.returnValue(of([]));
    dataServiceStub.fetchUserById.and.returnValue(of({ userId: 1 } as any));
    dataServiceStub.editUser.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ SignedInLandingPageComponent ],
      providers: [
        { provide: DataService, useValue: dataServiceStub },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignedInLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
