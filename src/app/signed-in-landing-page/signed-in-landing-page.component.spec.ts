import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedInLandingPageComponent } from './signed-in-landing-page.component';

describe('SignedInLandingPageComponent', () => {
  let component: SignedInLandingPageComponent;
  let fixture: ComponentFixture<SignedInLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignedInLandingPageComponent ]
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
