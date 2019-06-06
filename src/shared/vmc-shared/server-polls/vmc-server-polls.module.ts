import { ModuleWithProviders, NgModule } from '@angular/core';
import { VmcServerPolls } from './vmc-server-polls.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: []
})
export class VMCServerPollsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: VMCServerPollsModule,
      providers: [VmcServerPolls]
    };
  }
}
