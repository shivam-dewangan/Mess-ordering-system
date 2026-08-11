resource "helm_release" "kube_prometheus_stack" {
  name             = "monitoring"
  namespace        = "monitoring"
  create_namespace = true

  repository = "https://prometheus-community.github.io/helm-charts"

  chart = "kube-prometheus-stack"

  version = "87.18.1"

  timeout = 900

  wait          = true
  wait_for_jobs = true

  atomic = true

  values = [
    yamlencode({

      # ======================================================
      # GRAFANA
      # ======================================================

      grafana = {
        enabled = true

        adminUser     = "admin"
        adminPassword = var.grafana_admin_password

        persistence = {
          enabled      = true
          storageClass = "gp3"
          accessModes  = ["ReadWriteOnce"]
          size         = "5Gi"
        }

        service = {
          type = "LoadBalancer"
          port = 80
        }

        defaultDashboardsEnabled = true
        defaultDashboardsTimezone = "Asia/Kolkata"

        sidecar = {
          dashboards = {
            enabled = true
          }

          datasources = {
            enabled = true
          }
        }

        resources = {
          requests = {
            cpu    = "100m"
            memory = "256Mi"
          }

          limits = {
            cpu    = "500m"
            memory = "512Mi"
          }
        }
      }

      # ======================================================
      # PROMETHEUS
      # ======================================================

      prometheus = {
        enabled = true

        prometheusSpec = {

          retention = "7d"

          retentionSize = "10GB"

          scrapeInterval = "30s"

          evaluationInterval = "30s"

          storageSpec = {
            volumeClaimTemplate = {
              spec = {
                storageClassName = "gp3"

                accessModes = [
                  "ReadWriteOnce"
                ]

                resources = {
                  requests = {
                    storage = "10Gi"
                  }
                }
              }
            }
          }

          resources = {
            requests = {
              cpu    = "250m"
              memory = "512Mi"
            }

            limits = {
              cpu    = "1000m"
              memory = "1Gi"
            }
          }
        }

        service = {
          type = "ClusterIP"
        }
      }

      # ======================================================
      # ALERTMANAGER
      # ======================================================

      alertmanager = {
        enabled = true

        alertmanagerSpec = {

          retention = "120h"

          storage = {
            volumeClaimTemplate = {
              spec = {
                storageClassName = "gp3"

                accessModes = [
                  "ReadWriteOnce"
                ]

                resources = {
                  requests = {
                    storage = "2Gi"
                  }
                }
              }
            }
          }

          resources = {
            requests = {
              cpu    = "50m"
              memory = "128Mi"
            }

            limits = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }
        }
      }

      # ======================================================
      # NODE EXPORTER
      # ======================================================

      nodeExporter = {
        enabled = true
      }

      # ======================================================
      # KUBE STATE METRICS
      # ======================================================

      kubeStateMetrics = {
        enabled = true
      }

      # ======================================================
      # PROMETHEUS OPERATOR
      # ======================================================

      prometheusOperator = {
        enabled = true
      }

      # ======================================================
      # DEFAULT ALERT RULES
      # ======================================================

      defaultRules = {
        create = true

        rules = {
          alertmanager = true
          etcd         = true
          general      = true
          k8s          = true
          kubeApiserver = true
          kubelet      = true
          kubernetesApps = true
          kubernetesResources = true
          kubernetesStorage = true
          node = true
          prometheus = true
          prometheusOperator = true
        }
      }

      # ======================================================
      # CRDs
      # ======================================================

      crds = {
        enabled = true
      }
    })
  ]

  depends_on = [
    module.eks
  ]
}
