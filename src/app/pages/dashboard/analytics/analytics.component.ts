import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Task } from '../../../core/types/task.types';
import { TASK_PRIORITY_COLORS, TASK_STATUS_COLORS } from '../../../core/types/constants';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  imports: [],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements AfterViewInit, OnDestroy {
  readonly tasks = input.required<Task[]>();

  private readonly priorityCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('priorityChart');
  private readonly statusCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('statusChart');

  private priorityChart: Chart | null = null;
  private statusChart: Chart | null = null;
  private initialized = false;

  protected readonly priorityData = computed(() => {
    const tasks = this.tasks();
    return {
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    };
  });

  protected readonly statusData = computed(() => {
    const tasks = this.tasks();
    return {
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };
  });

  constructor() {
    effect(() => {
      const pd = this.priorityData();
      const sd = this.statusData();
      if (!this.initialized) return;
      this.updatePriorityChart(pd);
      this.updateStatusChart(sd);
    });
  }

  public ngAfterViewInit(): void {
    this.createPriorityChart();
    this.createStatusChart();
    this.initialized = true;
  }

  public ngOnDestroy(): void {
    this.priorityChart?.destroy();
    this.statusChart?.destroy();
  }

  private createPriorityChart(): void {
    const canvas = this.priorityCanvasRef()?.nativeElement;
    if (!canvas) return;

    const pd = this.priorityData();
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [
          {
            data: [pd.high, pd.medium, pd.low],
            backgroundColor: [
              TASK_PRIORITY_COLORS.high,
              TASK_PRIORITY_COLORS.medium,
              TASK_PRIORITY_COLORS.low,
            ],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, padding: 16, usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} task${ctx.parsed !== 1 ? 's' : ''}`,
            },
          },
        },
      },
    };
    this.priorityChart = new Chart(canvas, config);
  }

  private createStatusChart(): void {
    const canvas = this.statusCanvasRef()?.nativeElement;
    if (!canvas) return;

    const sd = this.statusData();
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [
          {
            label: 'Tasks',
            data: [sd.todo, sd.in_progress, sd.done],
            backgroundColor: [
              TASK_STATUS_COLORS.todo,
              TASK_STATUS_COLORS.in_progress,
              TASK_STATUS_COLORS.done,
            ],
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: '#f3f4f6' },
          },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} task${ctx.parsed.y !== 1 ? 's' : ''}`,
            },
          },
        },
      },
    };
    this.statusChart = new Chart(canvas, config);
  }

  private updatePriorityChart(pd: ReturnType<typeof this.priorityData>): void {
    if (!this.priorityChart) return;
    this.priorityChart.data.datasets[0].data = [pd.high, pd.medium, pd.low];
    this.priorityChart.update('active');
  }

  private updateStatusChart(sd: ReturnType<typeof this.statusData>): void {
    if (!this.statusChart) return;
    this.statusChart.data.datasets[0].data = [sd.todo, sd.in_progress, sd.done];
    this.statusChart.update('active');
  }
}
